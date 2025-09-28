"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums for choices
class GrantStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ReviewerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"

class TriageStatus(str, Enum):
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"

class ComplianceStatus(str, Enum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"
    MANUAL_REVIEW = "manual_review"

# Grant Schemas
class GrantBase(BaseModel):
    title: str
    principal_investigator: str
    pi_email: Optional[EmailStr] = None
    pi_institution: Optional[str] = None
    co_investigators: Optional[List[Dict[str, Any]]] = []
    budget_requested: Optional[float] = None
    budget_breakdown: Optional[Dict[str, Any]] = None
    duration_months: Optional[int] = None
    aims: Optional[str] = None
    abstract: Optional[str] = None
    keywords: Optional[List[str]] = []
    irb_approval: Optional[str] = None
    irb_number: Optional[str] = None
    human_subjects: bool = False
    animal_subjects: bool = False
    status: GrantStatus = GrantStatus.SUBMITTED
    priority: Priority = Priority.MEDIUM

class GrantCreate(GrantBase):
    pass

class GrantUpdate(BaseModel):
    title: Optional[str] = None
    principal_investigator: Optional[str] = None
    pi_email: Optional[EmailStr] = None
    pi_institution: Optional[str] = None
    co_investigators: Optional[List[Dict[str, Any]]] = None
    budget_requested: Optional[float] = None
    budget_breakdown: Optional[Dict[str, Any]] = None
    duration_months: Optional[int] = None
    aims: Optional[str] = None
    abstract: Optional[str] = None
    keywords: Optional[List[str]] = None
    irb_approval: Optional[str] = None
    irb_number: Optional[str] = None
    human_subjects: Optional[bool] = None
    animal_subjects: Optional[bool] = None
    status: Optional[GrantStatus] = None
    priority: Optional[Priority] = None

class GrantResponse(GrantBase):
    id: int
    document_path: Optional[str] = None
    document_type: Optional[str] = None
    upload_date: datetime
    ai_summary: Optional[str] = None
    eligibility_score: Optional[float] = None
    compliance_flags: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Reviewer Schemas
class ReviewerBase(BaseModel):
    name: str
    email: EmailStr
    title: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    orcid_id: Optional[str] = None
    pubmed_author_id: Optional[str] = None
    researcher_id: Optional[str] = None
    research_areas: Optional[List[str]] = []
    keywords: Optional[List[str]] = []
    subspecialties: Optional[List[str]] = []
    available: bool = True
    max_reviews_per_cycle: int = 5
    preferred_review_types: Optional[List[str]] = []
    coi_institutions: Optional[List[str]] = []
    coi_researchers: Optional[List[str]] = []
    coi_companies: Optional[List[str]] = []
    preferred_contact_method: str = "email"
    timezone: Optional[str] = None
    status: ReviewerStatus = ReviewerStatus.ACTIVE

class ReviewerCreate(ReviewerBase):
    pass

class ReviewerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    title: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    orcid_id: Optional[str] = None
    pubmed_author_id: Optional[str] = None
    researcher_id: Optional[str] = None
    research_areas: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    subspecialties: Optional[List[str]] = None
    available: Optional[bool] = None
    max_reviews_per_cycle: Optional[int] = None
    preferred_review_types: Optional[List[str]] = None
    coi_institutions: Optional[List[str]] = None
    coi_researchers: Optional[List[str]] = None
    coi_companies: Optional[List[str]] = None
    preferred_contact_method: Optional[str] = None
    timezone: Optional[str] = None
    status: Optional[ReviewerStatus] = None

class ReviewerResponse(ReviewerBase):
    id: int
    h_index: Optional[int] = None
    citation_count: Optional[int] = None
    publication_count: Optional[int] = None
    recent_publications: Optional[List[Dict[str, Any]]] = []
    current_review_count: int = 0
    average_review_time_days: Optional[float] = None
    review_quality_score: Optional[float] = None
    total_reviews_completed: int = 0
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Triage Schemas
class TriageRecordBase(BaseModel):
    grant_id: int
    reviewer_id: Optional[int] = None
    due_date: Optional[datetime] = None
    status: TriageStatus = TriageStatus.ASSIGNED
    priority: Priority = Priority.MEDIUM
    preliminary_score: Optional[float] = None
    detailed_comments: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendation: Optional[str] = None
    scientific_merit: Optional[float] = None
    innovation: Optional[float] = None
    feasibility: Optional[float] = None
    budget_appropriateness: Optional[float] = None
    investigator_qualifications: Optional[float] = None
    expedited_review: bool = False
    reviewer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    estimated_review_hours: Optional[float] = None
    actual_review_hours: Optional[float] = None

class TriageRecordCreate(TriageRecordBase):
    pass

class TriageRecordUpdate(BaseModel):
    reviewer_id: Optional[int] = None
    due_date: Optional[datetime] = None
    status: Optional[TriageStatus] = None
    priority: Optional[Priority] = None
    preliminary_score: Optional[float] = None
    detailed_comments: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendation: Optional[str] = None
    scientific_merit: Optional[float] = None
    innovation: Optional[float] = None
    feasibility: Optional[float] = None
    budget_appropriateness: Optional[float] = None
    investigator_qualifications: Optional[float] = None
    expedited_review: Optional[bool] = None
    reviewer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    estimated_review_hours: Optional[float] = None
    actual_review_hours: Optional[float] = None

class TriageRecordResponse(TriageRecordBase):
    id: int
    assignment_date: datetime
    completion_date: Optional[datetime] = None
    expertise_match_score: Optional[float] = None
    workload_score: Optional[float] = None
    availability_score: Optional[float] = None
    overall_match_score: Optional[float] = None
    conflict_of_interest_checked: bool = False
    reminder_sent_count: int = 0
    last_reminder_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Computed properties would need to be handled in the API layer
    
    class Config:
        from_attributes = True

# Compliance Schemas
class ComplianceCheckBase(BaseModel):
    grant_id: int
    check_type: str
    check_name: str
    description: Optional[str] = None
    status: ComplianceStatus = ComplianceStatus.PENDING
    score: Optional[float] = None
    confidence: Optional[float] = None
    findings: Optional[List[str]] = []
    violations: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    policy_document: Optional[str] = None
    policy_section: Optional[str] = None
    policy_version: Optional[str] = None
    requires_manual_review: bool = False
    severity: str = "medium"
    impact_description: Optional[str] = None
    automated: bool = True
    model_used: Optional[str] = None

class ComplianceCheckCreate(ComplianceCheckBase):
    pass

class ComplianceCheckUpdate(BaseModel):
    status: Optional[ComplianceStatus] = None
    score: Optional[float] = None
    confidence: Optional[float] = None
    findings: Optional[List[str]] = None
    violations: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    requires_manual_review: Optional[bool] = None
    manual_review_notes: Optional[str] = None
    manual_reviewer: Optional[str] = None
    severity: Optional[str] = None
    impact_description: Optional[str] = None

class ComplianceCheckResponse(ComplianceCheckBase):
    id: int
    rag_query: Optional[str] = None
    rag_response: Optional[str] = None
    rag_sources: Optional[List[str]] = []
    rag_confidence: Optional[float] = None
    manual_review_notes: Optional[str] = None
    manual_reviewer: Optional[str] = None
    manual_review_date: Optional[datetime] = None
    processing_time_seconds: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    checked_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class TriageDashboardSummary(BaseModel):
    triage_status_counts: Dict[str, int]
    overdue_reviews: int
    available_reviewers: int
    grant_status_counts: Dict[str, int]
    total_grants: int
    total_reviewers: int
    total_triage_records: int

class ComplianceDashboardSummary(BaseModel):
    status_counts: Dict[str, int]
    severity_counts: Dict[str, int]
    type_counts: Dict[str, int]
    manual_review_pending: int
    high_risk_findings: int
    average_compliance_score: float
    total_checks: int

# Batch operation schemas
class BatchAssignmentRequest(BaseModel):
    grant_ids: List[int]

class BatchAssignmentResponse(BaseModel):
    successful_assignments: int
    failed_assignments: int
    results: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]

class BatchComplianceRequest(BaseModel):
    grant_ids: List[int]
    check_types: Optional[List[str]] = None

class BatchComplianceResponse(BaseModel):
    successful_checks: int
    failed_checks: int
    results: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]

# Reviewer matching schemas
class ReviewerMatchResponse(BaseModel):
    reviewer_id: int
    reviewer_name: str
    reviewer_email: str
    reviewer_institution: Optional[str]
    overall_score: float
    expertise_score: float
    workload_score: float
    availability_score: float
    performance_score: float
    domain_score: float
    match_details: Dict[str, Any]

class ReviewerRecommendationsResponse(BaseModel):
    grant_id: int
    grant_title: str
    total_candidates: int
    recommendations: List[ReviewerMatchResponse]
    top_recommendation: Optional[ReviewerMatchResponse]
    score_distribution: Dict[str, int]
    selection_criteria: Dict[str, Any]

# File upload schemas
class FileUploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    upload_date: datetime
    processing_status: str
    extracted_metadata: Optional[Dict[str, Any]] = None