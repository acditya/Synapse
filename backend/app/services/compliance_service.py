"""
Compliance checking service using RAG over NMSS/UAE policies.
"""

import os
from typing import List, Dict, Any
import chromadb
from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from datetime import datetime

from ..models.grant import Grant
from ..services.ai_service import AIService

class ComplianceService:
    """Service for checking grant compliance against NMSS/UAE policies using RAG."""
    
    def __init__(self):
        self.ai_service = AIService()
        self.policy_docs_dir = os.getenv("POLICY_DOCS_DIR", "./policy_documents")
        self.vector_store = None
        self.qa_chain = None
        
        # Initialize RAG system
        self._initialize_rag_system()
    
    def _initialize_rag_system(self):
        """Initialize the RAG system with policy documents."""
        
        try:
            # Create policy documents directory if it doesn't exist
            os.makedirs(self.policy_docs_dir, exist_ok=True)
            
            # Check if we have policy documents
            if not os.listdir(self.policy_docs_dir):
                print("Warning: No policy documents found. Creating sample policies.")
                self._create_sample_policies()
            
            # Initialize embeddings
            embeddings = HuggingFaceEmbeddings(
                model_name=os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
            )
            
            # Load and process documents
            loader = DirectoryLoader(
                self.policy_docs_dir,
                glob="**/*.pdf",
                loader_cls=PyPDFLoader
            )
            
            documents = loader.load()
            
            if not documents:
                print("Warning: No documents loaded from policy directory")
                return
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            splits = text_splitter.split_documents(documents)
            
            # Create vector store
            self.vector_store = Chroma.from_documents(
                documents=splits,
                embedding=embeddings,
                persist_directory="./chroma_db"
            )
            
            # Initialize QA chain
            llm = OpenAI(temperature=0)
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 5}),
                return_source_documents=True
            )
            
            print("RAG system initialized successfully")
            
        except Exception as e:
            print(f"Error initializing RAG system: {e}")
            # Continue without RAG system - use rule-based checks only
    
    def _create_sample_policies(self):
        """Create sample NMSS policy documents for demonstration."""
        
        sample_policies = {
            "nmss_funding_guidelines.txt": """
NATIONAL MULTIPLE SCLEROSIS SOCIETY
RESEARCH FUNDING GUIDELINES

1. ELIGIBILITY CRITERIA
- Research must be directly relevant to multiple sclerosis
- Principal investigator must hold appropriate academic position
- Institution must have proper oversight mechanisms
- Budget must be reasonable and well-justified

2. SCIENTIFIC REQUIREMENTS
- Novel and innovative approaches preferred
- Strong preliminary data required for larger grants
- Clear methodology and statistical analysis plan
- Realistic timelines and milestones

3. ETHICAL REQUIREMENTS
- IRB approval required for human subjects research
- IACUC approval required for animal research
- Appropriate consent procedures must be in place
- Data sharing and management plans required

4. BUDGET GUIDELINES
- Direct costs only for most grant types
- Indirect costs limited to 10% for pilot grants
- Equipment purchases require special justification
- Personnel costs should not exceed 75% of total budget

5. ADMINISTRATIVE REQUIREMENTS
- All required forms must be completed
- Letters of support from collaborators required
- Curriculum vitae for all key personnel
- Detailed budget justification required
""",
            
            "uae_research_policies.txt": """
UAE RESEARCH POLICY FRAMEWORK

1. RESEARCH ETHICS
- All research involving human subjects requires ethics approval
- Animal research must follow international guidelines
- Conflicts of interest must be disclosed
- Data privacy and security measures required

2. COLLABORATION REQUIREMENTS
- International collaborations encouraged
- Local institutional partnerships preferred
- Technology transfer agreements may be required
- Intellectual property rights must be clearly defined

3. FUNDING COMPLIANCE
- Funds must be used for stated purposes only
- Regular progress reports required
- Financial auditing may be conducted
- Unused funds may need to be returned

4. PUBLICATION REQUIREMENTS
- Open access publication preferred
- UAE affiliation must be acknowledged
- Preprints and final publications must be shared
- Dataset sharing encouraged where appropriate
"""
        }
        
        for filename, content in sample_policies.items():
            filepath = os.path.join(self.policy_docs_dir, filename)
            with open(filepath, 'w') as f:
                f.write(content)
    
    async def run_comprehensive_check(
        self,
        grant: Grant,
        check_types: List[str]
    ) -> List[Dict[str, Any]]:
        """Run comprehensive compliance checks on a grant."""
        
        results = []
        
        for check_type in check_types:
            if check_type == "eligibility":
                result = await self._check_eligibility(grant)
            elif check_type == "policy_adherence":
                result = await self._check_policy_adherence(grant)
            elif check_type == "irb_compliance":
                result = await self._check_irb_compliance(grant)
            elif check_type == "budget_validation":
                result = await self._check_budget_validation(grant)
            elif check_type == "administrative_requirements":
                result = await self._check_administrative_requirements(grant)
            else:
                result = {
                    "check_type": check_type,
                    "check_name": f"Unknown Check: {check_type}",
                    "description": f"Unknown compliance check type: {check_type}",
                    "status": "failed",
                    "findings": [f"Unknown check type: {check_type}"]
                }
            
            results.append(result)
        
        return results
    
    async def run_quick_check(
        self,
        grant: Grant,
        check_types: List[str]
    ) -> List[Dict[str, Any]]:
        """Run quick compliance checks (simplified for batch processing)."""
        
        results = []
        
        for check_type in check_types:
            # Simplified checks for batch processing
            if check_type == "eligibility":
                score = 0.8 if grant.abstract and "multiple sclerosis" in grant.abstract.lower() else 0.3
                status = "passed" if score > 0.5 else "warning"
            else:
                score = 0.7  # Default moderate score
                status = "passed"
            
            result = {
                "check_type": check_type,
                "check_name": f"Quick {check_type.replace('_', ' ').title()} Check",
                "status": status,
                "score": score,
                "findings": ["Quick check completed"],
                "automated": True
            }
            
            results.append(result)
        
        return results
    
    async def _check_eligibility(self, grant: Grant) -> Dict[str, Any]:
        """Check grant eligibility against NMSS criteria."""
        
        start_time = datetime.now()
        
        # Prepare grant information for analysis
        grant_info = f"""
Title: {grant.title or 'N/A'}
Principal Investigator: {grant.principal_investigator or 'N/A'}
Institution: {grant.pi_institution or 'N/A'}
Abstract: {grant.abstract or 'N/A'}
Keywords: {', '.join(grant.keywords or [])}
Budget: ${grant.budget_requested or 0:,.2f}
Duration: {grant.duration_months or 'N/A'} months
"""

        findings = []
        violations = []
        recommendations = []
        status = "passed"
        score = 1.0
        
        # Rule-based eligibility checks
        
        # 1. MS Relevance Check
        ms_keywords = ['multiple sclerosis', 'ms', 'demyelination', 'neurodegeneration', 'autoimmune']
        grant_text = (grant.title or "").lower() + " " + (grant.abstract or "").lower()
        
        ms_relevance = any(keyword in grant_text for keyword in ms_keywords)
        if not ms_relevance:
            findings.append("Grant does not appear to be directly related to multiple sclerosis research")
            violations.append("Insufficient MS relevance")
            recommendations.append("Ensure research has clear relevance to multiple sclerosis")
            status = "warning"
            score -= 0.4
        else:
            findings.append("Grant demonstrates clear relevance to MS research")
        
        # 2. PI and Institution Check
        if not grant.principal_investigator or grant.principal_investigator == "Unknown":
            findings.append("Principal investigator information missing or incomplete")
            violations.append("Missing PI information")
            recommendations.append("Provide complete principal investigator information")
            status = "warning"
            score -= 0.2
        
        if not grant.pi_institution:
            findings.append("Institution information missing")
            violations.append("Missing institutional affiliation")
            recommendations.append("Provide institutional affiliation for PI")
            if status != "failed":
                status = "warning"
            score -= 0.1
        
        # 3. Abstract and Aims Check
        if not grant.abstract or len(grant.abstract) < 100:
            findings.append("Abstract missing or too brief")
            violations.append("Inadequate abstract")
            recommendations.append("Provide comprehensive abstract (minimum 100 words)")
            if status != "failed":
                status = "warning"
            score -= 0.2
        
        if not grant.aims:
            findings.append("Specific aims not clearly stated")
            recommendations.append("Include clear specific aims section")
            score -= 0.1
        
        # RAG-based eligibility check
        rag_response = None
        rag_sources = []
        rag_confidence = 0.0
        
        if self.qa_chain:
            try:
                query = f"""
                Is this research proposal eligible for NMSS funding based on the funding guidelines?
                
                Research Details:
                {grant_info}
                
                Please evaluate eligibility and provide specific reasons.
                """
                
                result = self.qa_chain({"query": query})
                rag_response = result["result"]
                rag_sources = [doc.metadata.get("source", "unknown") for doc in result.get("source_documents", [])]
                
                # Simple confidence calculation based on response content
                if "eligible" in rag_response.lower():
                    rag_confidence = 0.8
                elif "not eligible" in rag_response.lower():
                    rag_confidence = 0.8
                    status = "failed"
                    score = min(score, 0.3)
                else:
                    rag_confidence = 0.5
                
                findings.append(f"RAG Analysis: {rag_response}")
                
            except Exception as e:
                findings.append(f"RAG system error: {str(e)}")
        
        # Ensure score is between 0 and 1
        score = max(0.0, min(1.0, score))
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "check_type": "eligibility",
            "check_name": "NMSS Eligibility Check",
            "description": "Evaluation of grant eligibility against NMSS funding criteria",
            "status": status,
            "score": score,
            "confidence": 0.8,
            "findings": findings,
            "violations": violations,
            "recommendations": recommendations,
            "policy_document": "NMSS Funding Guidelines",
            "policy_section": "Eligibility Criteria",
            "policy_version": "2024",
            "rag_query": f"Eligibility check for: {grant.title}",
            "rag_response": rag_response,
            "rag_sources": rag_sources,
            "rag_confidence": rag_confidence,
            "requires_manual_review": status == "warning" and score < 0.6,
            "severity": "high" if status == "failed" else "medium" if status == "warning" else "low",
            "impact_description": "Determines if grant is eligible for NMSS funding consideration",
            "model_used": self.ai_service.default_model,
            "processing_time": processing_time
        }
    
    async def _check_policy_adherence(self, grant: Grant) -> Dict[str, Any]:
        """Check adherence to NMSS research policies."""
        
        start_time = datetime.now()
        
        findings = []
        violations = []
        recommendations = []
        status = "passed"
        score = 1.0
        
        # Check budget reasonableness
        if grant.budget_requested:
            if grant.budget_requested > 500000:  # Over $500K
                findings.append("High budget amount requires additional justification")
                recommendations.append("Provide detailed budget justification for high-cost items")
                score -= 0.1
            
            if grant.budget_requested < 5000:  # Under $5K
                findings.append("Unusually low budget may indicate incomplete cost estimation")
                recommendations.append("Review budget to ensure all necessary costs are included")
                score -= 0.1
        else:
            findings.append("Budget information missing")
            violations.append("Missing budget information")
            recommendations.append("Provide detailed budget information")
            status = "warning"
            score -= 0.3
        
        # Check duration reasonableness
        if grant.duration_months:
            if grant.duration_months > 60:  # Over 5 years
                findings.append("Long project duration requires strong justification")
                recommendations.append("Justify extended timeline with detailed milestones")
                score -= 0.1
            
            if grant.duration_months < 6:  # Under 6 months
                findings.append("Short duration may not allow for meaningful results")
                recommendations.append("Consider if timeline allows for adequate research completion")
                score -= 0.1
        
        # Check for innovation indicators
        innovation_keywords = ['novel', 'innovative', 'breakthrough', 'first-time', 'pioneering']
        grant_text = (grant.title or "").lower() + " " + (grant.abstract or "").lower()
        
        if any(keyword in grant_text for keyword in innovation_keywords):
            findings.append("Grant demonstrates innovative approach")
            score += 0.05  # Small bonus for innovation
        else:
            findings.append("Consider highlighting innovative aspects of the research")
            recommendations.append("Emphasize novel or innovative aspects of the proposed research")
        
        # Ensure score is between 0 and 1
        score = max(0.0, min(1.0, score))
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "check_type": "policy_adherence",
            "check_name": "NMSS Policy Adherence Check",
            "description": "Evaluation of compliance with NMSS research policies",
            "status": status,
            "score": score,
            "confidence": 0.7,
            "findings": findings,
            "violations": violations,
            "recommendations": recommendations,
            "policy_document": "NMSS Research Policies",
            "policy_section": "General Requirements",
            "policy_version": "2024",
            "requires_manual_review": len(violations) > 0,
            "severity": "medium" if violations else "low",
            "impact_description": "Ensures grant complies with NMSS research policy requirements",
            "model_used": "rule_based",
            "processing_time": processing_time
        }
    
    async def _check_irb_compliance(self, grant: Grant) -> Dict[str, Any]:
        """Check IRB/ethics compliance."""
        
        start_time = datetime.now()
        
        findings = []
        violations = []
        recommendations = []
        status = "passed"
        score = 1.0
        
        # Check human subjects research
        if grant.human_subjects:
            if not grant.irb_approval or grant.irb_approval in ["Unknown", "Pending"]:
                findings.append("Human subjects research detected without clear IRB approval")
                violations.append("Human subjects research requires IRB approval")
                recommendations.append("Obtain IRB approval before research initiation")
                status = "failed"
                score = 0.2
            else:
                findings.append(f"IRB approval status: {grant.irb_approval}")
                if grant.irb_number:
                    findings.append(f"IRB number provided: {grant.irb_number}")
        else:
            findings.append("No human subjects research indicated")
        
        # Check animal subjects research
        if grant.animal_subjects:
            findings.append("Animal subjects research detected - ensure IACUC approval")
            recommendations.append("Verify IACUC approval is obtained for animal research")
        
        # Check for ethics-related keywords
        ethics_keywords = ['ethics', 'consent', 'privacy', 'confidentiality', 'vulnerable population']
        grant_text = (grant.abstract or "").lower()
        
        ethics_mentions = [kw for kw in ethics_keywords if kw in grant_text]
        if ethics_mentions:
            findings.append(f"Ethics considerations mentioned: {', '.join(ethics_mentions)}")
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "check_type": "irb_compliance",
            "check_name": "IRB/Ethics Compliance Check",
            "description": "Evaluation of ethical compliance and IRB requirements",
            "status": status,
            "score": score,
            "confidence": 0.9,
            "findings": findings,
            "violations": violations,
            "recommendations": recommendations,
            "policy_document": "IRB Guidelines",
            "policy_section": "Human Subjects Research",
            "policy_version": "2024",
            "requires_manual_review": grant.human_subjects and not grant.irb_approval,
            "severity": "critical" if violations else "low",
            "impact_description": "Ensures ethical compliance for human/animal subjects research",
            "model_used": "rule_based",
            "processing_time": processing_time
        }
    
    async def _check_budget_validation(self, grant: Grant) -> Dict[str, Any]:
        """Validate budget information and reasonableness."""
        
        start_time = datetime.now()
        
        findings = []
        violations = []
        recommendations = []
        status = "passed"
        score = 1.0
        
        if not grant.budget_requested:
            findings.append("No budget information provided")
            violations.append("Missing budget")
            recommendations.append("Provide detailed budget information")
            status = "failed"
            score = 0.0
        else:
            budget = grant.budget_requested
            
            # Budget range checks
            if budget > 1000000:  # Over $1M
                findings.append("High budget amount requires exceptional justification")
                recommendations.append("Provide comprehensive justification for high budget")
                status = "warning"
                score -= 0.2
            elif budget > 250000:  # Over $250K
                findings.append("Moderate-high budget - ensure adequate justification")
                recommendations.append("Provide detailed budget justification")
            
            if budget < 1000:  # Under $1K
                findings.append("Very low budget may not support meaningful research")
                recommendations.append("Review if budget is adequate for proposed research")
                status = "warning"
                score -= 0.3
            
            # Check budget breakdown if available
            if grant.budget_breakdown:
                findings.append("Budget breakdown provided")
                
                # Analyze budget components
                breakdown = grant.budget_breakdown
                if isinstance(breakdown, dict):
                    personnel_cost = breakdown.get('personnel', 0) + breakdown.get('salary', 0)
                    if personnel_cost > budget * 0.8:  # Over 80% personnel
                        findings.append("High personnel costs (>80% of budget)")
                        recommendations.append("Consider if personnel allocation is appropriate")
            else:
                findings.append("No detailed budget breakdown provided")
                recommendations.append("Provide detailed budget breakdown by category")
                score -= 0.1
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "check_type": "budget_validation",
            "check_name": "Budget Validation Check",
            "description": "Validation of budget information and reasonableness",
            "status": status,
            "score": score,
            "confidence": 0.8,
            "findings": findings,
            "violations": violations,
            "recommendations": recommendations,
            "policy_document": "NMSS Budget Guidelines",
            "policy_section": "Budget Requirements",
            "policy_version": "2024",
            "requires_manual_review": status == "warning",
            "severity": "high" if violations else "medium" if status == "warning" else "low",
            "impact_description": "Ensures budget is reasonable and well-justified",
            "model_used": "rule_based",
            "processing_time": processing_time
        }
    
    async def _check_administrative_requirements(self, grant: Grant) -> Dict[str, Any]:
        """Check administrative and documentation requirements."""
        
        start_time = datetime.now()
        
        findings = []
        violations = []
        recommendations = []
        status = "passed"
        score = 1.0
        
        # Check required fields
        required_fields = {
            'title': grant.title,
            'principal_investigator': grant.principal_investigator,
            'abstract': grant.abstract,
            'pi_institution': grant.pi_institution
        }
        
        missing_fields = [field for field, value in required_fields.items() if not value]
        
        if missing_fields:
            findings.append(f"Missing required fields: {', '.join(missing_fields)}")
            violations.extend([f"Missing {field}" for field in missing_fields])
            recommendations.extend([f"Provide {field.replace('_', ' ')}" for field in missing_fields])
            status = "failed" if len(missing_fields) > 2 else "warning"
            score -= 0.2 * len(missing_fields)
        else:
            findings.append("All required fields provided")
        
        # Check document upload
        if not grant.document_path:
            findings.append("No supporting document uploaded")
            violations.append("Missing supporting documentation")
            recommendations.append("Upload complete grant proposal document")
            status = "warning"
            score -= 0.3
        else:
            findings.append("Supporting document uploaded")
        
        # Check contact information
        if not grant.pi_email:
            findings.append("PI email address not provided")
            recommendations.append("Provide PI contact email address")
            score -= 0.1
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "check_type": "administrative_requirements",
            "check_name": "Administrative Requirements Check",
            "description": "Verification of required documentation and information",
            "status": status,
            "score": max(0.0, score),
            "confidence": 0.9,
            "findings": findings,
            "violations": violations,
            "recommendations": recommendations,
            "policy_document": "NMSS Administrative Guidelines",
            "policy_section": "Submission Requirements",
            "policy_version": "2024",
            "requires_manual_review": len(violations) > 0,
            "severity": "medium" if violations else "low",
            "impact_description": "Ensures all required documentation is provided",
            "model_used": "rule_based",
            "processing_time": processing_time
        }