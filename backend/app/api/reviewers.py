"""
Reviewer management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.reviewer import Reviewer
from ..services.reviewer_service import ReviewerService
from ..utils.schemas import ReviewerCreate, ReviewerResponse, ReviewerUpdate

router = APIRouter()
reviewer_service = ReviewerService()

@router.post("/", response_model=ReviewerResponse)
async def create_reviewer(
    reviewer: ReviewerCreate,
    db: Session = Depends(get_db)
):
    """Create a new reviewer."""
    
    # Check if reviewer with email already exists
    existing_reviewer = db.query(Reviewer).filter(Reviewer.email == reviewer.email).first()
    if existing_reviewer:
        raise HTTPException(status_code=400, detail="Reviewer with this email already exists")
    
    # Check if ORCID ID already exists (if provided)
    if reviewer.orcid_id:
        existing_orcid = db.query(Reviewer).filter(Reviewer.orcid_id == reviewer.orcid_id).first()
        if existing_orcid:
            raise HTTPException(status_code=400, detail="Reviewer with this ORCID ID already exists")
    
    try:
        # Enrich reviewer data with external APIs
        enriched_data = await reviewer_service.enrich_reviewer_data(reviewer.dict())
        
        # Generate embeddings for expertise matching
        embeddings = await reviewer_service.generate_embeddings(enriched_data)
        enriched_data.update(embeddings)
        
        # Create reviewer
        db_reviewer = Reviewer(**enriched_data)
        db.add(db_reviewer)
        db.commit()
        db.refresh(db_reviewer)
        
        return db_reviewer
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating reviewer: {str(e)}")

@router.get("/", response_model=List[ReviewerResponse])
def get_reviewers(
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
    expertise_area: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of reviewers with optional filtering."""
    query = db.query(Reviewer)
    
    if available_only:
        query = query.filter(Reviewer.available == True, Reviewer.status == "active")
    
    if expertise_area:
        # Filter by research areas (JSON contains)
        query = query.filter(Reviewer.research_areas.contains([expertise_area]))
    
    reviewers = query.offset(skip).limit(limit).all()
    return reviewers

@router.get("/{reviewer_id}", response_model=ReviewerResponse)
def get_reviewer(reviewer_id: int, db: Session = Depends(get_db)):
    """Get a specific reviewer by ID."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    return reviewer

@router.get("/by-email/{email}", response_model=ReviewerResponse)
def get_reviewer_by_email(email: str, db: Session = Depends(get_db)):
    """Get a reviewer by email address."""
    reviewer = db.query(Reviewer).filter(Reviewer.email == email).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    return reviewer

@router.get("/by-orcid/{orcid_id}", response_model=ReviewerResponse)
def get_reviewer_by_orcid(orcid_id: str, db: Session = Depends(get_db)):
    """Get a reviewer by ORCID ID."""
    reviewer = db.query(Reviewer).filter(Reviewer.orcid_id == orcid_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    return reviewer

@router.put("/{reviewer_id}", response_model=ReviewerResponse)
def update_reviewer(
    reviewer_id: int,
    reviewer_update: ReviewerUpdate,
    db: Session = Depends(get_db)
):
    """Update a reviewer."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    
    update_data = reviewer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reviewer, field, value)
    
    reviewer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(reviewer)
    return reviewer

@router.delete("/{reviewer_id}")
def delete_reviewer(reviewer_id: int, db: Session = Depends(get_db)):
    """Delete a reviewer."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    
    db.delete(reviewer)
    db.commit()
    return {"message": "Reviewer deleted successfully"}

@router.post("/{reviewer_id}/refresh-data")
async def refresh_reviewer_data(reviewer_id: int, db: Session = Depends(get_db)):
    """Refresh reviewer data from external APIs (ORCID, PubMed)."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    
    try:
        # Refresh data from external sources
        refreshed_data = await reviewer_service.refresh_external_data(reviewer)
        
        # Update reviewer with refreshed data
        for field, value in refreshed_data.items():
            if hasattr(reviewer, field):
                setattr(reviewer, field, value)
        
        reviewer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(reviewer)
        
        return {"message": "Reviewer data refreshed successfully", "reviewer": reviewer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing reviewer data: {str(e)}")

@router.post("/{reviewer_id}/check-coi/{grant_id}")
def check_conflict_of_interest(
    reviewer_id: int,
    grant_id: int,
    db: Session = Depends(get_db)
):
    """Check for conflict of interest between reviewer and grant."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    
    from ..models.grant import Grant
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    has_coi = reviewer.has_conflict_of_interest(grant)
    coi_details = reviewer_service.detailed_coi_check(reviewer, grant)
    
    return {
        "has_conflict": has_coi,
        "details": coi_details,
        "reviewer_id": reviewer_id,
        "grant_id": grant_id
    }

@router.get("/{reviewer_id}/workload")
def get_reviewer_workload(reviewer_id: int, db: Session = Depends(get_db)):
    """Get current workload information for a reviewer."""
    reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    
    from ..models.triage import TriageRecord
    
    # Get current active reviews
    active_reviews = db.query(TriageRecord).filter(
        TriageRecord.reviewer_id == reviewer_id,
        TriageRecord.status.in_(["assigned", "in_progress"])
    ).all()
    
    # Calculate workload metrics
    workload = {
        "reviewer_id": reviewer_id,
        "current_reviews": len(active_reviews),
        "max_reviews": reviewer.max_reviews_per_cycle,
        "available_slots": reviewer.max_reviews_per_cycle - len(active_reviews),
        "is_available": reviewer.is_available,
        "active_review_details": [
            {
                "grant_id": review.grant_id,
                "assignment_date": review.assignment_date,
                "due_date": review.due_date,
                "status": review.status,
                "days_remaining": review.days_remaining
            }
            for review in active_reviews
        ]
    }
    
    return workload