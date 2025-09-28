"""
Reviewer service for managing reviewer data and external API integration.
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio

from ..models.reviewer import Reviewer
from ..services.ai_service import AIService

class ReviewerService:
    """Service for reviewer management and external API integration."""
    
    def __init__(self):
        self.ai_service = AIService()
        self.orcid_client_id = os.getenv("ORCID_CLIENT_ID")
        self.orcid_client_secret = os.getenv("ORCID_CLIENT_SECRET")
        self.pubmed_api_key = os.getenv("PUBMED_API_KEY")
    
    async def enrich_reviewer_data(self, reviewer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich reviewer data with information from external APIs."""
        
        enriched_data = reviewer_data.copy()
        
        # Try to get ORCID data
        if reviewer_data.get("orcid_id"):
            try:
                orcid_data = await self._fetch_orcid_data(reviewer_data["orcid_id"])
                enriched_data.update(orcid_data)
            except Exception as e:
                print(f"Error fetching ORCID data: {e}")
        
        # Try to get PubMed data
        if reviewer_data.get("name"):
            try:
                pubmed_data = await self._fetch_pubmed_data(reviewer_data["name"])
                enriched_data.update(pubmed_data)
            except Exception as e:
                print(f"Error fetching PubMed data: {e}")
        
        # Set default values if not provided
        enriched_data.setdefault("available", True)
        enriched_data.setdefault("max_reviews_per_cycle", 5)
        enriched_data.setdefault("current_review_count", 0)
        enriched_data.setdefault("status", "active")
        
        return enriched_data
    
    async def generate_embeddings(self, reviewer_data: Dict[str, Any]) -> Dict[str, List[float]]:
        """Generate embeddings for reviewer expertise matching."""
        
        embeddings = {}
        
        try:
            # Create expertise text
            expertise_parts = []
            
            if reviewer_data.get("research_areas"):
                expertise_parts.extend(reviewer_data["research_areas"])
            
            if reviewer_data.get("keywords"):
                expertise_parts.extend(reviewer_data["keywords"])
            
            if reviewer_data.get("subspecialties"):
                expertise_parts.extend(reviewer_data["subspecialties"])
            
            if expertise_parts:
                expertise_text = " ".join(expertise_parts)
                expertise_embedding = self.ai_service.embedding_model.encode(expertise_text)
                embeddings["expertise_embedding"] = expertise_embedding.tolist()
            
            # Create publications text
            if reviewer_data.get("recent_publications"):
                publications_text = " ".join([
                    pub.get("title", "") for pub in reviewer_data["recent_publications"]
                    if isinstance(pub, dict) and pub.get("title")
                ])
                
                if publications_text:
                    publications_embedding = self.ai_service.embedding_model.encode(publications_text)
                    embeddings["publications_embedding"] = publications_embedding.tolist()
        
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            # Return empty embeddings if generation fails
            embeddings = {
                "expertise_embedding": [],
                "publications_embedding": []
            }
        
        return embeddings
    
    async def _fetch_orcid_data(self, orcid_id: str) -> Dict[str, Any]:
        """Fetch data from ORCID API."""
        
        # Clean ORCID ID format
        if not orcid_id.startswith("http"):
            orcid_id = f"0000-0000-0000-{orcid_id}" if len(orcid_id) == 4 else orcid_id
        
        orcid_data = {}
        
        try:
            async with httpx.AsyncClient() as client:
                # Get basic profile info
                headers = {"Accept": "application/json"}
                url = f"https://pub.orcid.org/v3.0/{orcid_id}/person"
                
                response = await client.get(url, headers=headers, timeout=10.0)
                
                if response.status_code == 200:
                    person_data = response.json()
                    
                    # Extract name if not provided
                    if person_data.get("name"):
                        given_names = person_data["name"].get("given-names", {}).get("value", "")
                        family_name = person_data["name"].get("family-name", {}).get("value", "")
                        if given_names and family_name:
                            orcid_data["name"] = f"{given_names} {family_name}"
                
                # Get employment/education info
                url = f"https://pub.orcid.org/v3.0/{orcid_id}/employments"
                response = await client.get(url, headers=headers, timeout=10.0)
                
                if response.status_code == 200:
                    employment_data = response.json()
                    
                    # Extract current institution
                    if employment_data.get("employment-summary"):
                        for employment in employment_data["employment-summary"]:
                            if employment.get("organization"):
                                org_name = employment["organization"].get("name")
                                if org_name:
                                    orcid_data["institution"] = org_name
                                    break
                
                # Get works (publications)
                url = f"https://pub.orcid.org/v3.0/{orcid_id}/works"
                response = await client.get(url, headers=headers, timeout=10.0)
                
                if response.status_code == 200:
                    works_data = response.json()
                    
                    if works_data.get("group"):
                        publications = []
                        for group in works_data["group"][:10]:  # Limit to recent 10
                            if group.get("work-summary"):
                                work = group["work-summary"][0]
                                if work.get("title"):
                                    pub = {
                                        "title": work["title"].get("title", {}).get("value", ""),
                                        "year": work.get("publication-date", {}).get("year", {}).get("value"),
                                        "type": work.get("type")
                                    }
                                    publications.append(pub)
                        
                        orcid_data["recent_publications"] = publications
                        orcid_data["publication_count"] = len(publications)
        
        except Exception as e:
            print(f"Error fetching ORCID data for {orcid_id}: {e}")
        
        return orcid_data
    
    async def _fetch_pubmed_data(self, author_name: str) -> Dict[str, Any]:
        """Fetch publication data from PubMed API."""
        
        pubmed_data = {}
        
        try:
            async with httpx.AsyncClient() as client:
                # Search for author
                search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
                search_params = {
                    "db": "pubmed",
                    "term": f"{author_name}[author]",
                    "retmax": "20",
                    "retmode": "json",
                    "sort": "pub_date"
                }
                
                if self.pubmed_api_key:
                    search_params["api_key"] = self.pubmed_api_key
                
                response = await client.get(search_url, params=search_params, timeout=10.0)
                
                if response.status_code == 200:
                    search_data = response.json()
                    
                    if search_data.get("esearchresult", {}).get("idlist"):
                        pmids = search_data["esearchresult"]["idlist"]
                        pubmed_data["publication_count"] = len(pmids)
                        
                        # Get details for recent publications
                        if pmids:
                            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
                            fetch_params = {
                                "db": "pubmed",
                                "id": ",".join(pmids[:5]),  # Get details for 5 most recent
                                "rettype": "abstract",
                                "retmode": "xml"
                            }
                            
                            if self.pubmed_api_key:
                                fetch_params["api_key"] = self.pubmed_api_key
                            
                            # For simplicity, just store publication count
                            # Full XML parsing would be more complex
                            pubmed_data["recent_publications"] = [
                                {"title": f"PubMed Publication {i+1}", "pmid": pmid}
                                for i, pmid in enumerate(pmids[:5])
                            ]
        
        except Exception as e:
            print(f"Error fetching PubMed data for {author_name}: {e}")
        
        return pubmed_data
    
    async def refresh_external_data(self, reviewer: Reviewer) -> Dict[str, Any]:
        """Refresh reviewer data from external sources."""
        
        refreshed_data = {}
        
        # Refresh ORCID data
        if reviewer.orcid_id:
            try:
                orcid_data = await self._fetch_orcid_data(reviewer.orcid_id)
                refreshed_data.update(orcid_data)
            except Exception as e:
                print(f"Error refreshing ORCID data: {e}")
        
        # Refresh PubMed data
        if reviewer.name:
            try:
                pubmed_data = await self._fetch_pubmed_data(reviewer.name)
                refreshed_data.update(pubmed_data)
            except Exception as e:
                print(f"Error refreshing PubMed data: {e}")
        
        # Regenerate embeddings if expertise data changed
        if any(key in refreshed_data for key in ["research_areas", "keywords", "subspecialties"]):
            try:
                embeddings = await self.generate_embeddings({
                    "research_areas": refreshed_data.get("research_areas", reviewer.research_areas),
                    "keywords": refreshed_data.get("keywords", reviewer.keywords),
                    "subspecialties": refreshed_data.get("subspecialties", reviewer.subspecialties),
                    "recent_publications": refreshed_data.get("recent_publications", reviewer.recent_publications)
                })
                refreshed_data.update(embeddings)
            except Exception as e:
                print(f"Error regenerating embeddings: {e}")
        
        return refreshed_data
    
    def detailed_coi_check(self, reviewer: Reviewer, grant) -> Dict[str, Any]:
        """Perform detailed conflict of interest check."""
        
        coi_details = {
            "has_conflict": False,
            "conflict_types": [],
            "details": []
        }
        
        # Check institutional conflicts
        if reviewer.coi_institutions and grant.pi_institution:
            for coi_inst in reviewer.coi_institutions:
                if coi_inst.lower() in grant.pi_institution.lower():
                    coi_details["has_conflict"] = True
                    coi_details["conflict_types"].append("institutional")
                    coi_details["details"].append(f"Institutional conflict: {coi_inst}")
        
        # Check researcher conflicts
        if reviewer.coi_researchers:
            # Check PI
            if grant.principal_investigator:
                for coi_researcher in reviewer.coi_researchers:
                    if coi_researcher.lower() in grant.principal_investigator.lower():
                        coi_details["has_conflict"] = True
                        coi_details["conflict_types"].append("researcher")
                        coi_details["details"].append(f"PI conflict: {coi_researcher}")
            
            # Check co-investigators
            if grant.co_investigators:
                for co_inv in grant.co_investigators:
                    co_inv_name = co_inv.get("name", "") if isinstance(co_inv, dict) else str(co_inv)
                    for coi_researcher in reviewer.coi_researchers:
                        if coi_researcher.lower() in co_inv_name.lower():
                            coi_details["has_conflict"] = True
                            coi_details["conflict_types"].append("researcher")
                            coi_details["details"].append(f"Co-investigator conflict: {coi_researcher}")
        
        # Check for same institution (potential conflict)
        if (reviewer.institution and grant.pi_institution and 
            reviewer.institution.lower() == grant.pi_institution.lower()):
            coi_details["conflict_types"].append("same_institution")
            coi_details["details"].append("Same institutional affiliation")
            # This might not be a hard conflict, depending on policy
        
        # Check for close collaboration indicators
        if reviewer.recent_publications and grant.principal_investigator:
            for pub in reviewer.recent_publications:
                if isinstance(pub, dict) and pub.get("title"):
                    # Simple check if PI name appears in publication title
                    # (This is a very basic check - real implementation would be more sophisticated)
                    pi_parts = grant.principal_investigator.split()
                    if len(pi_parts) >= 2:
                        last_name = pi_parts[-1].lower()
                        if last_name in pub["title"].lower():
                            coi_details["conflict_types"].append("potential_collaboration")
                            coi_details["details"].append("Potential recent collaboration detected")
                            break
        
        return coi_details
    
    async def bulk_import_reviewers(self, reviewer_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk import reviewers with data enrichment."""
        
        results = {
            "successful": [],
            "failed": [],
            "total_processed": len(reviewer_list)
        }
        
        for reviewer_data in reviewer_list:
            try:
                # Enrich data
                enriched_data = await self.enrich_reviewer_data(reviewer_data)
                
                # Generate embeddings
                embeddings = await self.generate_embeddings(enriched_data)
                enriched_data.update(embeddings)
                
                results["successful"].append({
                    "name": enriched_data.get("name"),
                    "email": enriched_data.get("email"),
                    "enriched_fields": list(enriched_data.keys())
                })
                
                # In a real implementation, you would save to database here
                
            except Exception as e:
                results["failed"].append({
                    "data": reviewer_data,
                    "error": str(e)
                })
        
        return results