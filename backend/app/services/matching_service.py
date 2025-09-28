"""
Service for matching grants with reviewers using AI embeddings and criteria.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import numpy as np
from datetime import datetime

from ..models.grant import Grant
from ..models.reviewer import Reviewer
from ..services.ai_service import AIService

class MatchingService:
    """Service for AI-powered grant-reviewer matching."""
    
    def __init__(self):
        self.ai_service = AIService()
        
        # Matching weights (can be adjusted)
        self.weights = {
            "expertise_similarity": 0.4,
            "workload_balance": 0.2,
            "availability": 0.2,
            "performance_history": 0.1,
            "domain_match": 0.1
        }
    
    async def find_best_reviewers(
        self,
        grant: Grant,
        limit: int = 5,
        exclude_reviewer_ids: List[int] = None
    ) -> List[Dict[str, Any]]:
        """Find the best matching reviewers for a grant."""
        
        exclude_reviewer_ids = exclude_reviewer_ids or []
        
        # Get all available reviewers
        from ..database import SessionLocal
        db = SessionLocal()
        
        try:
            query = db.query(Reviewer).filter(
                Reviewer.available == True,
                Reviewer.status == "active"
            )
            
            if exclude_reviewer_ids:
                query = query.filter(~Reviewer.id.in_(exclude_reviewer_ids))
            
            available_reviewers = query.all()
            
            if not available_reviewers:
                return []
            
            # Calculate match scores for each reviewer
            matches = []
            for reviewer in available_reviewers:
                # Skip if reviewer has conflict of interest
                if reviewer.has_conflict_of_interest(grant):
                    continue
                
                # Skip if reviewer is at capacity
                if not reviewer.is_available:
                    continue
                
                match_scores = await self.calculate_match_scores(reviewer, grant)
                matches.append({
                    "reviewer_id": reviewer.id,
                    "reviewer_name": reviewer.name,
                    "reviewer_email": reviewer.email,
                    "reviewer_institution": reviewer.institution,
                    "overall_score": match_scores["overall_score"],
                    "expertise_score": match_scores["expertise_score"],
                    "workload_score": match_scores["workload_score"],
                    "availability_score": match_scores["availability_score"],
                    "performance_score": match_scores["performance_score"],
                    "domain_score": match_scores["domain_score"],
                    "match_details": match_scores["details"]
                })
            
            # Sort by overall score and return top matches
            matches.sort(key=lambda x: x["overall_score"], reverse=True)
            return matches[:limit]
            
        finally:
            db.close()
    
    async def calculate_match_scores(self, reviewer: Reviewer, grant: Grant) -> Dict[str, Any]:
        """Calculate comprehensive match scores between reviewer and grant."""
        
        scores = {}
        details = {}
        
        # 1. Expertise similarity score
        expertise_score, expertise_details = self._calculate_expertise_similarity(reviewer, grant)
        scores["expertise_score"] = expertise_score
        details["expertise"] = expertise_details
        
        # 2. Workload balance score
        workload_score, workload_details = self._calculate_workload_score(reviewer)
        scores["workload_score"] = workload_score
        details["workload"] = workload_details
        
        # 3. Availability score
        availability_score, availability_details = self._calculate_availability_score(reviewer)
        scores["availability_score"] = availability_score
        details["availability"] = availability_details
        
        # 4. Performance history score
        performance_score, performance_details = self._calculate_performance_score(reviewer)
        scores["performance_score"] = performance_score
        details["performance"] = performance_details
        
        # 5. Domain match score
        domain_score, domain_details = self._calculate_domain_match(reviewer, grant)
        scores["domain_score"] = domain_score
        details["domain"] = domain_details
        
        # Calculate overall weighted score
        overall_score = (
            scores["expertise_score"] * self.weights["expertise_similarity"] +
            scores["workload_score"] * self.weights["workload_balance"] +
            scores["availability_score"] * self.weights["availability"] +
            scores["performance_score"] * self.weights["performance_history"] +
            scores["domain_score"] * self.weights["domain_match"]
        )
        
        scores["overall_score"] = overall_score
        scores["details"] = details
        
        return scores
    
    def _calculate_expertise_similarity(self, reviewer: Reviewer, grant: Grant) -> tuple[float, Dict[str, Any]]:
        """Calculate similarity between reviewer expertise and grant content."""
        
        similarities = []
        details = {}
        
        try:
            # Compare reviewer expertise embedding with grant embeddings
            if reviewer.expertise_embedding and grant.abstract_embedding:
                abstract_sim = self.ai_service.calculate_similarity(
                    reviewer.expertise_embedding,
                    grant.abstract_embedding
                )
                similarities.append(abstract_sim)
                details["abstract_similarity"] = round(abstract_sim, 3)
            
            if reviewer.expertise_embedding and grant.title_embedding:
                title_sim = self.ai_service.calculate_similarity(
                    reviewer.expertise_embedding,
                    grant.title_embedding
                )
                similarities.append(title_sim)
                details["title_similarity"] = round(title_sim, 3)
            
            if reviewer.expertise_embedding and grant.keywords_embedding:
                keywords_sim = self.ai_service.calculate_similarity(
                    reviewer.expertise_embedding,
                    grant.keywords_embedding
                )
                similarities.append(keywords_sim)
                details["keywords_similarity"] = round(keywords_sim, 3)
            
            # Keyword overlap check
            reviewer_keywords = set((reviewer.keywords or []))
            grant_keywords = set((grant.keywords or []))
            
            if reviewer_keywords and grant_keywords:
                keyword_overlap = len(reviewer_keywords.intersection(grant_keywords))
                keyword_union = len(reviewer_keywords.union(grant_keywords))
                keyword_score = keyword_overlap / keyword_union if keyword_union > 0 else 0
                similarities.append(keyword_score)
                details["keyword_overlap"] = {
                    "common_keywords": list(reviewer_keywords.intersection(grant_keywords)),
                    "overlap_score": round(keyword_score, 3)
                }
            
            # Research areas match
            reviewer_areas = set((reviewer.research_areas or []))
            
            if reviewer_areas and grant.keywords:
                grant_keywords_lower = [kw.lower() for kw in grant.keywords]
                reviewer_areas_lower = [area.lower() for area in reviewer_areas]
                
                area_matches = [area for area in reviewer_areas_lower 
                              if any(kw in area or area in kw for kw in grant_keywords_lower)]
                
                if area_matches:
                    area_score = len(area_matches) / len(reviewer_areas)
                    similarities.append(area_score)
                    details["research_area_matches"] = area_matches
            
            # Calculate average similarity
            if similarities:
                avg_similarity = sum(similarities) / len(similarities)
                details["component_count"] = len(similarities)
                details["average_similarity"] = round(avg_similarity, 3)
                return avg_similarity, details
            else:
                details["error"] = "No similarity components could be calculated"
                return 0.3, details  # Default moderate score
                
        except Exception as e:
            details["error"] = f"Error calculating expertise similarity: {str(e)}"
            return 0.3, details
    
    def _calculate_workload_score(self, reviewer: Reviewer) -> tuple[float, Dict[str, Any]]:
        """Calculate score based on reviewer's current workload."""
        
        details = {}
        
        try:
            current_load = reviewer.current_review_count
            max_load = reviewer.max_reviews_per_cycle
            
            if max_load <= 0:
                details["error"] = "Invalid max reviews per cycle"
                return 0.0, details
            
            # Calculate workload ratio
            workload_ratio = current_load / max_load
            
            # Score inversely related to workload (less workload = higher score)
            if workload_ratio >= 1.0:
                score = 0.0  # At capacity
            else:
                score = 1.0 - workload_ratio
            
            details.update({
                "current_reviews": current_load,
                "max_reviews": max_load,
                "workload_ratio": round(workload_ratio, 3),
                "available_slots": max_load - current_load
            })
            
            return score, details
            
        except Exception as e:
            details["error"] = f"Error calculating workload score: {str(e)}"
            return 0.5, details
    
    def _calculate_availability_score(self, reviewer: Reviewer) -> tuple[float, Dict[str, Any]]:
        """Calculate availability score based on reviewer status."""
        
        details = {}
        
        try:
            if not reviewer.available:
                details["status"] = "Not available"
                return 0.0, details
            
            if reviewer.status != "active":
                details["status"] = f"Status: {reviewer.status}"
                return 0.0, details
            
            # Check if at capacity
            if reviewer.current_review_count >= reviewer.max_reviews_per_cycle:
                details["status"] = "At capacity"
                return 0.0, details
            
            # Base availability score
            score = 1.0
            
            # Adjust based on how close to capacity
            capacity_ratio = reviewer.current_review_count / reviewer.max_reviews_per_cycle
            if capacity_ratio > 0.8:  # Above 80% capacity
                score *= 0.7
            elif capacity_ratio > 0.6:  # Above 60% capacity
                score *= 0.85
            
            details.update({
                "status": "Available",
                "capacity_utilization": round(capacity_ratio, 3),
                "availability_level": "high" if capacity_ratio < 0.5 else "medium" if capacity_ratio < 0.8 else "low"
            })
            
            return score, details
            
        except Exception as e:
            details["error"] = f"Error calculating availability score: {str(e)}"
            return 0.5, details
    
    def _calculate_performance_score(self, reviewer: Reviewer) -> tuple[float, Dict[str, Any]]:
        """Calculate score based on reviewer's historical performance."""
        
        details = {}
        
        try:
            # Base score if no performance data
            if reviewer.total_reviews_completed == 0:
                details["status"] = "New reviewer (no history)"
                return 0.7, details  # Moderate score for new reviewers
            
            score = 0.5  # Base score
            
            # Review quality score (1-5 scale)
            if reviewer.review_quality_score:
                quality_contribution = (reviewer.review_quality_score - 3.0) / 2.0  # Normalize to -1 to 1
                score += quality_contribution * 0.3
                details["quality_score"] = reviewer.review_quality_score
            
            # Average review time (penalty for very slow reviewers)
            if reviewer.average_review_time_days:
                if reviewer.average_review_time_days <= 14:  # Within 2 weeks
                    time_bonus = 0.2
                elif reviewer.average_review_time_days <= 21:  # Within 3 weeks
                    time_bonus = 0.1
                elif reviewer.average_review_time_days <= 30:  # Within 1 month
                    time_bonus = 0.0
                else:  # Over 1 month
                    time_bonus = -0.2
                
                score += time_bonus
                details["avg_review_time_days"] = reviewer.average_review_time_days
                details["time_performance"] = "excellent" if time_bonus > 0.1 else "good" if time_bonus >= 0 else "needs_improvement"
            
            # Experience bonus
            if reviewer.total_reviews_completed >= 50:
                score += 0.1  # Very experienced
            elif reviewer.total_reviews_completed >= 20:
                score += 0.05  # Experienced
            
            details.update({
                "total_reviews": reviewer.total_reviews_completed,
                "experience_level": "high" if reviewer.total_reviews_completed >= 20 else "medium" if reviewer.total_reviews_completed >= 5 else "low"
            })
            
            # Ensure score is between 0 and 1
            score = max(0.0, min(1.0, score))
            
            return score, details
            
        except Exception as e:
            details["error"] = f"Error calculating performance score: {str(e)}"
            return 0.5, details
    
    def _calculate_domain_match(self, reviewer: Reviewer, grant: Grant) -> tuple[float, Dict[str, Any]]:
        """Calculate domain-specific matching score."""
        
        details = {}
        
        try:
            score = 0.5  # Base score
            
            # Check for MS-specific expertise
            ms_keywords = [
                'multiple sclerosis', 'ms', 'demyelination', 'neurodegeneration',
                'autoimmune', 'central nervous system', 'oligodendrocyte',
                'myelin', 'neuroinflammation', 'eae', 'experimental autoimmune encephalomyelitis'
            ]
            
            reviewer_text = " ".join([
                reviewer.name or "",
                " ".join(reviewer.research_areas or []),
                " ".join(reviewer.keywords or []),
                " ".join(reviewer.subspecialties or [])
            ]).lower()
            
            grant_text = " ".join([
                grant.title or "",
                grant.abstract or "",
                " ".join(grant.keywords or [])
            ]).lower()
            
            # Count MS-related terms in reviewer profile
            reviewer_ms_terms = sum(1 for term in ms_keywords if term in reviewer_text)
            grant_ms_terms = sum(1 for term in ms_keywords if term in grant_text)
            
            if grant_ms_terms > 0 and reviewer_ms_terms > 0:
                # Both have MS relevance
                ms_match_score = min(reviewer_ms_terms, grant_ms_terms) / max(reviewer_ms_terms, grant_ms_terms)
                score += ms_match_score * 0.3
                details["ms_relevance"] = {
                    "reviewer_ms_terms": reviewer_ms_terms,
                    "grant_ms_terms": grant_ms_terms,
                    "match_score": round(ms_match_score, 3)
                }
            
            # Check for methodological alignment
            methods_keywords = [
                'imaging', 'mri', 'microscopy', 'flow cytometry', 'proteomics',
                'genomics', 'bioinformatics', 'statistical analysis', 'clinical trial',
                'animal model', 'cell culture', 'biochemistry', 'immunology'
            ]
            
            reviewer_methods = [term for term in methods_keywords if term in reviewer_text]
            grant_methods = [term for term in methods_keywords if term in grant_text]
            
            common_methods = set(reviewer_methods).intersection(set(grant_methods))
            if common_methods:
                methods_score = len(common_methods) / max(len(reviewer_methods), len(grant_methods), 1)
                score += methods_score * 0.2
                details["methodological_alignment"] = {
                    "common_methods": list(common_methods),
                    "methods_score": round(methods_score, 3)
                }
            
            # Ensure score is between 0 and 1
            score = max(0.0, min(1.0, score))
            
            return score, details
            
        except Exception as e:
            details["error"] = f"Error calculating domain match: {str(e)}"
            return 0.5, details
    
    async def get_reviewer_recommendations(
        self,
        grant_id: int,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Get comprehensive reviewer recommendations for a grant."""
        
        from ..database import SessionLocal
        db = SessionLocal()
        
        try:
            grant = db.query(Grant).filter(Grant.id == grant_id).first()
            if not grant:
                raise ValueError(f"Grant {grant_id} not found")
            
            # Find best matches
            matches = await self.find_best_reviewers(grant, limit=limit)
            
            # Add additional context
            recommendations = {
                "grant_id": grant_id,
                "grant_title": grant.title,
                "total_candidates": len(matches),
                "recommendations": matches,
                "selection_criteria": {
                    "weights": self.weights,
                    "factors_considered": [
                        "Expertise similarity (embeddings + keyword matching)",
                        "Current workload and availability",
                        "Historical performance and review quality",
                        "Domain-specific MS research experience",
                        "Conflict of interest screening"
                    ]
                }
            }
            
            if matches:
                recommendations["top_recommendation"] = matches[0]
                recommendations["score_distribution"] = {
                    "high_scores": len([m for m in matches if m["overall_score"] > 0.7]),
                    "medium_scores": len([m for m in matches if 0.4 <= m["overall_score"] <= 0.7]),
                    "low_scores": len([m for m in matches if m["overall_score"] < 0.4])
                }
            
            return recommendations
            
        finally:
            db.close()