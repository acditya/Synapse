"""
Triage management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.triage import TriageRecord
from ..models.grant import Grant
from ..models.reviewer import Reviewer
from ..services.matching_service import MatchingService
from ..utils.schemas import TriageRecordCreate, TriageRecordResponse, TriageRecordUpdate

router = APIRouter()
matching_service = MatchingService()

@router.post("/assign", response_model=TriageRecordResponse)
async def assign_reviewer(
    grant_id: int,
    reviewer_id: Optional[int] = None,
    auto_assign: bool = False,
    db: Session = Depends(get_db)
):
    """Assign a reviewer to a grant, either manually or automatically."""
    
    # Validate grant exists
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Check if grant already has an active assignment
    existing_assignment = db.query(TriageRecord).filter(
        TriageRecord.grant_id == grant_id,
        TriageRecord.status.in_(["assigned", "in_progress"])
    ).first()
    
    if existing_assignment:
        raise HTTPException(status_code=400, detail="Grant already has an active reviewer assignment")
    
    try:
        if auto_assign:
            # Use AI matching to find best reviewer
            best_matches = await matching_service.find_best_reviewers(grant, limit=3)
            if not best_matches:
                raise HTTPException(status_code=404, detail="No suitable reviewers found")
            
            # Select the best match
            best_match = best_matches[0]
            reviewer_id = best_match["reviewer_id"]
            match_scores = best_match
            
        else:
            # Manual assignment - validate reviewer
            if not reviewer_id:
                raise HTTPException(status_code=400, detail="Reviewer ID required for manual assignment")
            
            reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
            if reviewer is None:
                raise HTTPException(status_code=404, detail="Reviewer not found")
            
            # Check availability and COI
            if not reviewer.is_available:
                raise HTTPException(status_code=400, detail="Reviewer is not available")
            
            if reviewer.has_conflict_of_interest(grant):
                raise HTTPException(status_code=400, detail="Reviewer has conflict of interest")
            
            # Calculate match scores for manual assignment
            match_scores = await matching_service.calculate_match_scores(reviewer, grant)
        
        # Create triage record
        due_date = datetime.utcnow() + timedelta(days=14)  # Default 2 weeks
        
        triage_record = TriageRecord(
            grant_id=grant_id,
            reviewer_id=reviewer_id,
            due_date=due_date,
            expertise_match_score=match_scores.get("expertise_score", 0.5),
            workload_score=match_scores.get("workload_score", 0.5),
            availability_score=match_scores.get("availability_score", 0.5),
            overall_match_score=match_scores.get("overall_score", 0.5),
            conflict_of_interest_checked=True
        )
        
        db.add(triage_record)
        
        # Update reviewer's current review count
        reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
        reviewer.current_review_count += 1
        
        db.commit()
        db.refresh(triage_record)
        
        return triage_record
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning reviewer: {str(e)}")

@router.get("/", response_model=List[TriageRecordResponse])
def get_triage_records(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    reviewer_id: Optional[int] = None,
    grant_id: Optional[int] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get list of triage records with optional filtering."""
    query = db.query(TriageRecord)
    
    if status:
        query = query.filter(TriageRecord.status == status)
    if reviewer_id:
        query = query.filter(TriageRecord.reviewer_id == reviewer_id)
    if grant_id:
        query = query.filter(TriageRecord.grant_id == grant_id)
    if overdue_only:
        query = query.filter(
            TriageRecord.due_date < datetime.utcnow(),
            TriageRecord.status.in_(["assigned", "in_progress"])
        )
    
    records = query.offset(skip).limit(limit).all()
    return records

@router.get("/{triage_id}", response_model=TriageRecordResponse)
def get_triage_record(triage_id: int, db: Session = Depends(get_db)):
    """Get a specific triage record by ID."""
    record = db.query(TriageRecord).filter(TriageRecord.id == triage_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Triage record not found")
    return record

@router.put("/{triage_id}", response_model=TriageRecordResponse)
def update_triage_record(
    triage_id: int,
    record_update: TriageRecordUpdate,
    db: Session = Depends(get_db)
):
    """Update a triage record."""
    record = db.query(TriageRecord).filter(TriageRecord.id == triage_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Triage record not found")
    
    update_data = record_update.dict(exclude_unset=True)
    
    # Special handling for status changes
    if "status" in update_data:
        old_status = record.status
        new_status = update_data["status"]
        
        # If completing review, set completion date
        if new_status == "completed" and old_status != "completed":
            update_data["completion_date"] = datetime.utcnow()
            
            # Update reviewer's current review count
            if record.reviewer_id:
                reviewer = db.query(Reviewer).filter(Reviewer.id == record.reviewer_id).first()
                if reviewer and reviewer.current_review_count > 0:
                    reviewer.current_review_count -= 1
    
    for field, value in update_data.items():
        setattr(record, field, value)
    
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{triage_id}")
def delete_triage_record(triage_id: int, db: Session = Depends(get_db)):
    """Delete a triage record."""
    record = db.query(TriageRecord).filter(TriageRecord.id == triage_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Triage record not found")
    
    # Update reviewer's current review count if record was active
    if record.status in ["assigned", "in_progress"] and record.reviewer_id:
        reviewer = db.query(Reviewer).filter(Reviewer.id == record.reviewer_id).first()
        if reviewer and reviewer.current_review_count > 0:
            reviewer.current_review_count -= 1
    
    db.delete(record)
    db.commit()
    return {"message": "Triage record deleted successfully"}

@router.post("/batch-assign")
async def batch_assign_reviewers(
    grant_ids: List[int],
    db: Session = Depends(get_db)
):
    """Batch assign reviewers to multiple grants using AI matching."""
    
    results = []
    errors = []
    
    for grant_id in grant_ids:
        try:
            # Check if grant exists and doesn't have active assignment
            grant = db.query(Grant).filter(Grant.id == grant_id).first()
            if not grant:
                errors.append({"grant_id": grant_id, "error": "Grant not found"})
                continue
            
            existing_assignment = db.query(TriageRecord).filter(
                TriageRecord.grant_id == grant_id,
                TriageRecord.status.in_(["assigned", "in_progress"])
            ).first()
            
            if existing_assignment:
                errors.append({"grant_id": grant_id, "error": "Already has active assignment"})
                continue
            
            # Find best reviewer
            best_matches = await matching_service.find_best_reviewers(grant, limit=1)
            if not best_matches:
                errors.append({"grant_id": grant_id, "error": "No suitable reviewers found"})
                continue
            
            best_match = best_matches[0]
            reviewer_id = best_match["reviewer_id"]
            
            # Create triage record
            due_date = datetime.utcnow() + timedelta(days=14)
            
            triage_record = TriageRecord(
                grant_id=grant_id,
                reviewer_id=reviewer_id,
                due_date=due_date,
                expertise_match_score=best_match.get("expertise_score", 0.5),
                workload_score=best_match.get("workload_score", 0.5),
                availability_score=best_match.get("availability_score", 0.5),
                overall_match_score=best_match.get("overall_score", 0.5),
                conflict_of_interest_checked=True
            )
            
            db.add(triage_record)
            
            # Update reviewer's current review count
            reviewer = db.query(Reviewer).filter(Reviewer.id == reviewer_id).first()
            reviewer.current_review_count += 1
            
            results.append({
                "grant_id": grant_id,
                "reviewer_id": reviewer_id,
                "triage_record_id": triage_record.id,
                "match_score": best_match.get("overall_score", 0.5)
            })
            
        except Exception as e:
            errors.append({"grant_id": grant_id, "error": str(e)})
    
    db.commit()
    
    return {
        "successful_assignments": len(results),
        "failed_assignments": len(errors),
        "results": results,
        "errors": errors
    }

@router.get("/dashboard/summary")
def get_triage_dashboard_summary(db: Session = Depends(get_db)):
    """Get summary statistics for the triage dashboard."""
    
    # Count records by status
    status_counts = db.query(TriageRecord.status, db.func.count(TriageRecord.id)).group_by(TriageRecord.status).all()
    
    # Count overdue reviews
    overdue_count = db.query(TriageRecord).filter(
        TriageRecord.due_date < datetime.utcnow(),
        TriageRecord.status.in_(["assigned", "in_progress"])
    ).count()
    
    # Count available reviewers
    available_reviewers = db.query(Reviewer).filter(
        Reviewer.available == True,
        Reviewer.status == "active"
    ).count()
    
    # Count grants by status
    grant_status_counts = db.query(Grant.status, db.func.count(Grant.id)).group_by(Grant.status).all()
    
    return {
        "triage_status_counts": {status: count for status, count in status_counts},
        "overdue_reviews": overdue_count,
        "available_reviewers": available_reviewers,
        "grant_status_counts": {status: count for status, count in grant_status_counts},
        "total_grants": db.query(Grant).count(),
        "total_reviewers": db.query(Reviewer).count(),
        "total_triage_records": db.query(TriageRecord).count()
    }