"""
Compliance checking API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.compliance import ComplianceCheck
from ..models.grant import Grant
from ..services.compliance_service import ComplianceService
from ..utils.schemas import ComplianceCheckResponse, ComplianceCheckUpdate

router = APIRouter()
compliance_service = ComplianceService()

@router.post("/check/{grant_id}")
async def run_compliance_check(
    grant_id: int,
    check_types: Optional[List[str]] = None,
    db: Session = Depends(get_db)
):
    """Run compliance checks on a grant."""
    
    # Validate grant exists
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Default check types if none specified
    if not check_types:
        check_types = [
            "eligibility",
            "policy_adherence",
            "irb_compliance",
            "budget_validation",
            "administrative_requirements"
        ]
    
    try:
        # Run compliance checks
        check_results = await compliance_service.run_comprehensive_check(grant, check_types)
        
        # Store results in database
        compliance_records = []
        for result in check_results:
            compliance_check = ComplianceCheck(
                grant_id=grant_id,
                check_type=result["check_type"],
                check_name=result["check_name"],
                description=result["description"],
                status=result["status"],
                score=result.get("score"),
                confidence=result.get("confidence"),
                findings=result.get("findings", []),
                violations=result.get("violations", []),
                recommendations=result.get("recommendations", []),
                policy_document=result.get("policy_document"),
                policy_section=result.get("policy_section"),
                policy_version=result.get("policy_version"),
                rag_query=result.get("rag_query"),
                rag_response=result.get("rag_response"),
                rag_sources=result.get("rag_sources", []),
                rag_confidence=result.get("rag_confidence"),
                requires_manual_review=result.get("requires_manual_review", False),
                severity=result.get("severity", "medium"),
                impact_description=result.get("impact_description"),
                model_used=result.get("model_used"),
                processing_time_seconds=result.get("processing_time", 0)
            )
            
            db.add(compliance_check)
            compliance_records.append(compliance_check)
        
        # Update grant's compliance flags
        all_violations = []
        for result in check_results:
            all_violations.extend(result.get("violations", []))
        
        grant.compliance_flags = all_violations
        grant.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Refresh all records
        for record in compliance_records:
            db.refresh(record)
        
        return {
            "grant_id": grant_id,
            "checks_completed": len(compliance_records),
            "overall_status": "passed" if all(r.status == "passed" for r in check_results) else "needs_attention",
            "compliance_checks": compliance_records
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running compliance checks: {str(e)}")

@router.get("/grant/{grant_id}", response_model=List[ComplianceCheckResponse])
def get_grant_compliance_checks(
    grant_id: int,
    check_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get compliance checks for a specific grant."""
    
    # Validate grant exists
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if grant is None:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    query = db.query(ComplianceCheck).filter(ComplianceCheck.grant_id == grant_id)
    
    if check_type:
        query = query.filter(ComplianceCheck.check_type == check_type)
    if status:
        query = query.filter(ComplianceCheck.status == status)
    
    checks = query.order_by(ComplianceCheck.created_at.desc()).all()
    return checks

@router.get("/{check_id}", response_model=ComplianceCheckResponse)
def get_compliance_check(check_id: int, db: Session = Depends(get_db)):
    """Get a specific compliance check by ID."""
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id).first()
    if check is None:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    return check

@router.put("/{check_id}", response_model=ComplianceCheckResponse)
def update_compliance_check(
    check_id: int,
    check_update: ComplianceCheckUpdate,
    db: Session = Depends(get_db)
):
    """Update a compliance check (typically for manual review)."""
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id).first()
    if check is None:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    
    update_data = check_update.dict(exclude_unset=True)
    
    # Special handling for manual review completion
    if "manual_review_notes" in update_data or "status" in update_data:
        update_data["manual_review_date"] = datetime.utcnow()
        if not update_data.get("manual_reviewer"):
            update_data["manual_reviewer"] = "System Admin"  # Should be actual user
    
    for field, value in update_data.items():
        setattr(check, field, value)
    
    check.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(check)
    return check

@router.delete("/{check_id}")
def delete_compliance_check(check_id: int, db: Session = Depends(get_db)):
    """Delete a compliance check."""
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id).first()
    if check is None:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    
    db.delete(check)
    db.commit()
    return {"message": "Compliance check deleted successfully"}

@router.get("/")
def get_all_compliance_checks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    check_type: Optional[str] = None,
    severity: Optional[str] = None,
    needs_review: bool = False,
    db: Session = Depends(get_db)
):
    """Get all compliance checks with filtering."""
    query = db.query(ComplianceCheck)
    
    if status:
        query = query.filter(ComplianceCheck.status == status)
    if check_type:
        query = query.filter(ComplianceCheck.check_type == check_type)
    if severity:
        query = query.filter(ComplianceCheck.severity == severity)
    if needs_review:
        query = query.filter(ComplianceCheck.requires_manual_review == True)
    
    checks = query.order_by(ComplianceCheck.created_at.desc()).offset(skip).limit(limit).all()
    return checks

@router.get("/dashboard/summary")
def get_compliance_dashboard_summary(db: Session = Depends(get_db)):
    """Get compliance dashboard summary statistics."""
    
    # Count checks by status
    status_counts = db.query(
        ComplianceCheck.status,
        db.func.count(ComplianceCheck.id)
    ).group_by(ComplianceCheck.status).all()
    
    # Count checks by severity
    severity_counts = db.query(
        ComplianceCheck.severity,
        db.func.count(ComplianceCheck.id)
    ).group_by(ComplianceCheck.severity).all()
    
    # Count checks by type
    type_counts = db.query(
        ComplianceCheck.check_type,
        db.func.count(ComplianceCheck.id)
    ).group_by(ComplianceCheck.check_type).all()
    
    # Count checks requiring manual review
    manual_review_count = db.query(ComplianceCheck).filter(
        ComplianceCheck.requires_manual_review == True,
        ComplianceCheck.manual_review_date.is_(None)
    ).count()
    
    # Count high-risk findings
    high_risk_count = db.query(ComplianceCheck).filter(
        ComplianceCheck.status == "failed",
        ComplianceCheck.severity.in_(["high", "critical"])
    ).count()
    
    # Average compliance scores by grant
    avg_scores = db.query(
        db.func.avg(ComplianceCheck.score)
    ).filter(ComplianceCheck.score.isnot(None)).scalar()
    
    return {
        "status_counts": {status: count for status, count in status_counts},
        "severity_counts": {severity: count for severity, count in severity_counts},
        "type_counts": {check_type: count for check_type, count in type_counts},
        "manual_review_pending": manual_review_count,
        "high_risk_findings": high_risk_count,
        "average_compliance_score": round(avg_scores or 0, 2),
        "total_checks": db.query(ComplianceCheck).count()
    }

@router.post("/batch-check")
async def batch_compliance_check(
    grant_ids: List[int],
    check_types: Optional[List[str]] = None,
    db: Session = Depends(get_db)
):
    """Run compliance checks on multiple grants."""
    
    results = []
    errors = []
    
    for grant_id in grant_ids:
        try:
            grant = db.query(Grant).filter(Grant.id == grant_id).first()
            if not grant:
                errors.append({"grant_id": grant_id, "error": "Grant not found"})
                continue
            
            # Run compliance checks (simplified version for batch processing)
            check_results = await compliance_service.run_quick_check(grant, check_types or ["eligibility"])
            
            # Store minimal results
            for result in check_results:
                compliance_check = ComplianceCheck(
                    grant_id=grant_id,
                    check_type=result["check_type"],
                    check_name=result["check_name"],
                    status=result["status"],
                    score=result.get("score"),
                    findings=result.get("findings", []),
                    automated=True
                )
                db.add(compliance_check)
            
            results.append({
                "grant_id": grant_id,
                "checks_completed": len(check_results),
                "overall_status": "passed" if all(r["status"] == "passed" for r in check_results) else "needs_attention"
            })
            
        except Exception as e:
            errors.append({"grant_id": grant_id, "error": str(e)})
    
    db.commit()
    
    return {
        "successful_checks": len(results),
        "failed_checks": len(errors),
        "results": results,
        "errors": errors
    }