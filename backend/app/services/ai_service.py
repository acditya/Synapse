"""
AI service for grant analysis, summarization, and embedding generation.
"""

import os
from typing import Dict, Any, List
import openai
from sentence_transformers import SentenceTransformer
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class AIService:
    """Service for AI-powered grant analysis and processing."""
    
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Initialize embedding model
        embedding_model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        try:
            self.embedding_model = SentenceTransformer(embedding_model_name)
        except Exception:
            # Fallback to a basic model if the specified one fails
            self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # LLM settings
        self.default_model = os.getenv("DEFAULT_LLM_MODEL", "gpt-3.5-turbo")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.3"))
    
    async def analyze_grant(self, grant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive analysis of a grant proposal."""
        
        analysis = {}
        
        # Generate AI summary
        analysis["summary"] = await self._generate_summary(grant_data)
        
        # Calculate eligibility score
        analysis["eligibility_score"] = await self._calculate_eligibility_score(grant_data)
        
        # Identify compliance flags
        analysis["compliance_flags"] = await self._identify_compliance_flags(grant_data)
        
        # Generate embeddings
        embeddings = self._generate_embeddings(grant_data)
        analysis.update(embeddings)
        
        return analysis
    
    async def _generate_summary(self, grant_data: Dict[str, Any]) -> str:
        """Generate a one-page LLM summary of the grant."""
        
        # Prepare content for summarization
        content_parts = []
        
        if grant_data.get("title"):
            content_parts.append(f"Title: {grant_data['title']}")
        
        if grant_data.get("principal_investigator"):
            content_parts.append(f"Principal Investigator: {grant_data['principal_investigator']}")
        
        if grant_data.get("pi_institution"):
            content_parts.append(f"Institution: {grant_data['pi_institution']}")
        
        if grant_data.get("abstract"):
            content_parts.append(f"Abstract: {grant_data['abstract']}")
        
        if grant_data.get("aims"):
            content_parts.append(f"Specific Aims: {grant_data['aims']}")
        
        if grant_data.get("budget_requested"):
            content_parts.append(f"Budget Requested: ${grant_data['budget_requested']:,.2f}")
        
        if grant_data.get("duration_months"):
            content_parts.append(f"Duration: {grant_data['duration_months']} months")
        
        content = "\n\n".join(content_parts)
        
        prompt = f"""
Please provide a comprehensive one-page summary of this research grant proposal for NMSS (National Multiple Sclerosis Society) review. 

The summary should include:
1. Research Overview: Brief description of the project and its objectives
2. Scientific Merit: Assessment of the innovation and potential impact
3. Methodology: Summary of proposed research approach
4. Feasibility: Evaluation of the project's viability
5. Budget Assessment: Comments on budget appropriateness
6. Investigator Qualifications: Brief assessment of PI and team capabilities
7. Multiple Sclerosis Relevance: How this research relates to MS research priorities
8. Key Strengths and Potential Concerns

Grant Proposal Details:
{content}

Please provide a professional, objective summary suitable for grant reviewers:
"""

        try:
            response = await self._call_openai(prompt, max_tokens=self.max_tokens)
            return response
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    async def _calculate_eligibility_score(self, grant_data: Dict[str, Any]) -> float:
        """Calculate eligibility score based on NMSS criteria."""
        
        # Prepare content for eligibility assessment
        content_parts = []
        
        if grant_data.get("title"):
            content_parts.append(f"Title: {grant_data['title']}")
        
        if grant_data.get("abstract"):
            content_parts.append(f"Abstract: {grant_data['abstract']}")
        
        if grant_data.get("keywords"):
            content_parts.append(f"Keywords: {', '.join(grant_data['keywords'])}")
        
        content = "\n".join(content_parts)
        
        prompt = f"""
As an expert reviewer for the National Multiple Sclerosis Society (NMSS), please evaluate this grant proposal's eligibility for NMSS funding.

Consider these NMSS funding criteria:
1. Direct relevance to multiple sclerosis research
2. Scientific rigor and innovation
3. Potential for significant impact on MS understanding or treatment
4. Alignment with NMSS research priorities
5. Feasibility and appropriate methodology

Rate the proposal's eligibility on a scale of 0.0 to 1.0, where:
- 0.0-0.3: Not eligible or poorly aligned with NMSS priorities
- 0.4-0.6: Moderately eligible with some relevance to MS
- 0.7-0.9: Highly eligible and well-aligned with NMSS goals
- 1.0: Exceptionally eligible and directly advances MS research

Proposal Details:
{content}

Please respond with just a single number between 0.0 and 1.0 representing the eligibility score:
"""

        try:
            response = await self._call_openai(prompt, max_tokens=50)
            # Extract numerical score from response
            score_str = response.strip()
            score = float(score_str)
            return max(0.0, min(1.0, score))  # Ensure score is between 0 and 1
        except Exception:
            # Return moderate score if parsing fails
            return 0.5
    
    async def _identify_compliance_flags(self, grant_data: Dict[str, Any]) -> List[str]:
        """Identify potential compliance issues."""
        
        flags = []
        
        # Budget-related flags
        if grant_data.get("budget_requested"):
            budget = grant_data["budget_requested"]
            if budget > 1000000:  # Over $1M
                flags.append("high_budget_amount")
            if budget < 10000:  # Under $10K
                flags.append("unusually_low_budget")
        
        # IRB-related flags
        if grant_data.get("human_subjects") and not grant_data.get("irb_approval"):
            flags.append("human_subjects_no_irb")
        
        # Duration flags
        if grant_data.get("duration_months"):
            duration = grant_data["duration_months"]
            if duration > 60:  # Over 5 years
                flags.append("long_duration")
            if duration < 6:  # Under 6 months
                flags.append("short_duration")
        
        # Missing critical information
        if not grant_data.get("abstract"):
            flags.append("missing_abstract")
        
        if not grant_data.get("aims"):
            flags.append("missing_aims")
        
        # AI-based compliance check
        try:
            ai_flags = await self._ai_compliance_check(grant_data)
            flags.extend(ai_flags)
        except Exception:
            pass  # Don't fail if AI check fails
        
        return flags
    
    async def _ai_compliance_check(self, grant_data: Dict[str, Any]) -> List[str]:
        """AI-based compliance flag identification."""
        
        content = f"""
Title: {grant_data.get('title', 'N/A')}
Abstract: {grant_data.get('abstract', 'N/A')}
Budget: ${grant_data.get('budget_requested', 0):,.2f}
Human Subjects: {grant_data.get('human_subjects', False)}
Animal Subjects: {grant_data.get('animal_subjects', False)}
IRB Status: {grant_data.get('irb_approval', 'Not specified')}
"""

        prompt = f"""
Review this grant proposal for potential compliance issues with NMSS funding guidelines.

Look for these types of issues:
- Ethical concerns (human/animal subjects without proper approval)
- Budget irregularities or unclear justification
- Missing required information
- Scope creep or unfocused objectives
- Potential conflicts of interest
- Administrative compliance issues

Proposal Details:
{content}

List any compliance flags you identify, one per line. If no issues are found, respond with "none".
Use these flag names when applicable:
- ethical_concerns
- budget_issues
- missing_information
- scope_issues
- administrative_issues
- potential_conflicts

Response:
"""

        try:
            response = await self._call_openai(prompt, max_tokens=200)
            
            flags = []
            for line in response.strip().split('\n'):
                line = line.strip().lower()
                if line and line != 'none':
                    # Extract flag name if it starts with a dash
                    if line.startswith('-'):
                        flag = line[1:].strip()
                    else:
                        flag = line
                    
                    # Only include valid flag names
                    valid_flags = [
                        'ethical_concerns', 'budget_issues', 'missing_information',
                        'scope_issues', 'administrative_issues', 'potential_conflicts'
                    ]
                    
                    if flag in valid_flags:
                        flags.append(flag)
            
            return flags
        except Exception:
            return []
    
    def _generate_embeddings(self, grant_data: Dict[str, Any]) -> Dict[str, List[float]]:
        """Generate embeddings for matching purposes."""
        
        embeddings = {}
        
        try:
            # Title embedding
            if grant_data.get("title"):
                title_embedding = self.embedding_model.encode(grant_data["title"])
                embeddings["title_embedding"] = title_embedding.tolist()
            
            # Abstract embedding
            if grant_data.get("abstract"):
                abstract_embedding = self.embedding_model.encode(grant_data["abstract"])
                embeddings["abstract_embedding"] = abstract_embedding.tolist()
            
            # Keywords embedding
            if grant_data.get("keywords"):
                keywords_text = " ".join(grant_data["keywords"])
                keywords_embedding = self.embedding_model.encode(keywords_text)
                embeddings["keywords_embedding"] = keywords_embedding.tolist()
            
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            # Return empty embeddings if generation fails
            embeddings = {
                "title_embedding": [],
                "abstract_embedding": [],
                "keywords_embedding": []
            }
        
        return embeddings
    
    async def _call_openai(self, prompt: str, max_tokens: int = None) -> str:
        """Make a call to OpenAI API."""
        
        if not openai.api_key:
            raise Exception("OpenAI API key not configured")
        
        try:
            response = openai.ChatCompletion.create(
                model=self.default_model,
                messages=[
                    {"role": "system", "content": "You are an expert grant reviewer for the National Multiple Sclerosis Society with deep knowledge of MS research and funding criteria."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        
        if not embedding1 or not embedding2:
            return 0.0
        
        try:
            # Convert to numpy arrays
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Calculate cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return float(similarity)
            
        except Exception:
            return 0.0
    
    async def regenerate_analysis(self, grant_data: Dict[str, Any], analysis_type: str = "all") -> Dict[str, Any]:
        """Regenerate specific parts of the grant analysis."""
        
        result = {}
        
        if analysis_type in ["all", "summary"]:
            result["summary"] = await self._generate_summary(grant_data)
        
        if analysis_type in ["all", "eligibility"]:
            result["eligibility_score"] = await self._calculate_eligibility_score(grant_data)
        
        if analysis_type in ["all", "compliance"]:
            result["compliance_flags"] = await self._identify_compliance_flags(grant_data)
        
        if analysis_type in ["all", "embeddings"]:
            embeddings = self._generate_embeddings(grant_data)
            result.update(embeddings)
        
        return result