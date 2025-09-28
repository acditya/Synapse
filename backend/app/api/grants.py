"""
Grant management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil

from ..database import get_db
from ..models.grant import Grant
from ..services.document_processor import DocumentProcessor
from ..services.ai_service import AIService
from ..utils.schemas import GrantCreate, GrantResponse, GrantUpdate

router = APIRouter()
document_processor = DocumentProcessor()
ai_service = AIService()

@router.post("/upload", response_model=GrantResponse)
async def upload_grant_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload and process a grant document."""
    
    # Validate file type
    allowed_types = ['.pdf', '.docx', '.doc']
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not supported")
    
    # Create upload directory if it doesn't exist
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save uploaded file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Process document to extract metadata
        extracted_data = await document_processor.process_document(file_path)
        
        # Generate AI summary and embeddings
        ai_analysis = await ai_service.analyze_grant(extracted_data)
        
        # Create grant record
        grant_data = {
            "title": title or extracted_data.get("title", "Untitled Grant"),
            "principal_investigator": extracted_data.get("principal_investigator", "Unknown"),
            "pi_email": extracted_data.get("pi_email"),
            "pi_institution": extracted_data.get("pi_institution"),
            "co_investigators": extracted_data.get("co_investigators", []),
            "budget_requested": extracted_data.get("budget_requested"),
            "budget_breakdown": extracted_data.get("budget_breakdown"),
            "duration_months": extracted_data.get("duration_months"),
            "aims": extracted_data.get("aims"),
            "abstract": extracted_data.get("abstract"),
            "keywords": extracted_data.get("keywords", []),
            "irb_approval": extracted_data.get("irb_approval"),
            "irb_number": extracted_data.get("irb_number"),
            "human_subjects": extracted_data.get("human_subjects", False),
            "animal_subjects": extracted_data.get("animal_subjects", False),
            "document_path": file_path,
            "document_type": file_extension,
            "ai_summary": ai_analysis.get("summary"),
            "eligibility_score": ai_analysis.get("eligibility_score"),
            "compliance_flags": ai_analysis.get("compliance_flags", []),
            "title_embedding": ai_analysis.get("title_embedding"),
            "abstract_embedding": ai_analysis.get("abstract_embedding"),
            "keywords_embedding": ai_analysis.get("keywords_embedding")
        }
        
        grant = Grant(**grant_data)
        db.add(grant)
        db.commit()
        db.refresh(grant)
        
        return grant
        
    except Exception as e:
        # Clean up uploaded file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/", response_model=List[GrantResponse])
def get_grants(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of grants with optional filtering."""
    query = db.query(Grant)
    
    if status:
        query = query.filter(Grant.status == status)
    if priority:
        query = query.filter(Grant.priority == priority)
    
    grants = query.offset(skip).limit(limit).all()
    return grants

@router.get("/{grant_id}", response_model=GrantResponse)
def get_grant(grant_id: int, db: Session = Depends(get_db)):
    """Get a specific grant by ID."""
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant

@router.put("/{grant_id}", response_model=GrantResponse)
def update_grant(
    grant_id: int,
    grant_update: GrantUpdate,
    db: Session = Depends(get_db)
):
    """Update a grant."""
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    update_data = grant_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grant, field, value)
    
    grant.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(grant)
    return grant

@router.delete("/{grant_id}")
def delete_grant(grant_id: int, db: Session = Depends(get_db)):
    """Delete a grant."""
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Clean up document file
    if grant.document_path and os.path.exists(grant.document_path):
        os.remove(grant.document_path)
    
    db.delete(grant)
    db.commit()
    return {"message": "Grant deleted successfully"}

@router.post("/{grant_id}/regenerate-summary")
async def regenerate_summary(grant_id: int, db: Session = Depends(get_db)):
    """Regenerate AI summary for a grant."""
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Extract data for re-analysis
    grant_data = {
        "title": grant.title,
        "abstract": grant.abstract,
        "aims": grant.aims,
        "keywords": grant.keywords
    }
    
    # Generate new AI analysis
    ai_analysis = await ai_service.analyze_grant(grant_data)
    
    # Update grant with new analysis
    grant.ai_summary = ai_analysis.get("summary")
    grant.eligibility_score = ai_analysis.get("eligibility_score")
    grant.compliance_flags = ai_analysis.get("compliance_flags", [])
    grant.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(grant)
    
    return {"message": "Summary regenerated successfully", "grant": grant}