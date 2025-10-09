"""
LLM service implementation using Llama 3.2.
Handles text generation, evaluation, and analysis tasks.
"""

import asyncio
import time
import json
from typing import List, Dict, Any, Optional, Union
from loguru import logger

from ..utils.langchain_utils import get_rag_pipeline
from ..models.schemas import EvaluationResult, EvaluationScore, EvaluationCriteria


class LLMService:
    """Service for LLM operations using Llama 3.2."""
    
    def __init__(self):
        """Initialize the LLM service."""
        self.rag_pipeline = None
        self._initialize_service()
    
    def _initialize_service(self) -> None:
        """Initialize the LLM service."""
        try:
            self.rag_pipeline = get_rag_pipeline()
            logger.info("LLM service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize LLM service: {e}")
            raise
    
    async def generate_text(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """Generate text using Llama 3.2."""
        try:
            start_time = time.time()
            
            # Use the LLM from the RAG pipeline
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.rag_pipeline.llm(prompt)
            )
            
            processing_time = time.time() - start_time
            logger.info(f"Generated text in {processing_time:.2f}s")
            
            return result.strip()
            
        except Exception as e:
            logger.error(f"Failed to generate text: {e}")
            raise
    
    async def summarize_text(
        self, 
        text: str, 
        max_length: int = 500
    ) -> str:
        """Summarize text using Llama 3.2."""
        try:
            start_time = time.time()
            
            summary = await self.rag_pipeline.summarize_document(text, max_length)
            
            processing_time = time.time() - start_time
            logger.info(f"Summarized text in {processing_time:.2f}s")
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to summarize text: {e}")
            raise
    
    async def evaluate_document(
        self, 
        content: str,
        criteria: Optional[List[EvaluationCriteria]] = None,
        context: Optional[str] = None
    ) -> EvaluationResult:
        """Evaluate a document using Llama 3.2."""
        try:
            start_time = time.time()
            
            # Prepare criteria
            if not criteria:
                criteria = [EvaluationCriteria(c) for c in ["relevance", "accuracy", "completeness", "consistency", "clarity"]]
            
            criteria_names = [c.value for c in criteria]
            
            # Get evaluation from RAG pipeline
            evaluation_data = await self.rag_pipeline.evaluate_document(
                content=content,
                criteria=criteria_names,
                context=context
            )
            
            # Convert to EvaluationResult
            evaluation_result = self._parse_evaluation_result(evaluation_data, criteria)
            
            processing_time = time.time() - start_time
            logger.info(f"Evaluated document in {processing_time:.2f}s")
            
            return evaluation_result
            
        except Exception as e:
            logger.error(f"Failed to evaluate document: {e}")
            # Return default evaluation on failure
            return EvaluationResult(
                overall_score=0.0,
                criterion_scores=[],
                summary="Evaluation failed due to an error.",
                strengths=[],
                weaknesses=["Evaluation service unavailable"],
                recommendations=["Please try again later"],
                consistency_issues=[],
                missing_information=[]
            )
    
    def _parse_evaluation_result(
        self, 
        evaluation_data: Dict[str, Any], 
        criteria: List[EvaluationCriteria]
    ) -> EvaluationResult:
        """Parse evaluation data into EvaluationResult."""
        try:
            # Extract overall score
            overall_score = evaluation_data.get("overall_score", 5.0)
            if not isinstance(overall_score, (int, float)):
                overall_score = 5.0
            
            # Extract criterion scores
            criterion_scores = []
            raw_scores = evaluation_data.get("criterion_scores", [])
            
            for criterion in criteria:
                # Find matching score in raw data
                score_data = next(
                    (s for s in raw_scores if s.get("criterion") == criterion.value), 
                    {}
                )
                
                criterion_score = EvaluationScore(
                    criterion=criterion,
                    score=score_data.get("score", 5.0),
                    reasoning=score_data.get("reasoning", "No reasoning provided")
                )
                criterion_scores.append(criterion_score)
            
            # Extract other fields
            summary = evaluation_data.get("summary", "No summary provided")
            strengths = evaluation_data.get("strengths", [])
            weaknesses = evaluation_data.get("weaknesses", [])
            recommendations = evaluation_data.get("recommendations", [])
            consistency_issues = evaluation_data.get("consistency_issues", [])
            missing_information = evaluation_data.get("missing_information", [])
            
            return EvaluationResult(
                overall_score=float(overall_score),
                criterion_scores=criterion_scores,
                summary=str(summary),
                strengths=strengths if isinstance(strengths, list) else [],
                weaknesses=weaknesses if isinstance(weaknesses, list) else [],
                recommendations=recommendations if isinstance(recommendations, list) else [],
                consistency_issues=consistency_issues if isinstance(consistency_issues, list) else [],
                missing_information=missing_information if isinstance(missing_information, list) else []
            )
            
        except Exception as e:
            logger.error(f"Failed to parse evaluation result: {e}")
            # Return default result
            return EvaluationResult(
                overall_score=5.0,
                criterion_scores=[],
                summary="Failed to parse evaluation result",
                strengths=[],
                weaknesses=["Evaluation parsing failed"],
                recommendations=["Please try again"],
                consistency_issues=[],
                missing_information=[]
            )
    
    async def check_consistency(
        self, 
        main_content: str, 
        reference_documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check consistency between main content and references."""
        try:
            start_time = time.time()
            
            # Convert reference documents to LangChain format
            from langchain.schema import Document
            ref_docs = [
                Document(page_content=doc.get("content", ""), metadata=doc.get("metadata", {}))
                for doc in reference_documents
            ]
            
            consistency_result = await self.rag_pipeline.check_consistency(main_content, ref_docs)
            
            processing_time = time.time() - start_time
            logger.info(f"Checked consistency in {processing_time:.2f}s")
            
            return consistency_result
            
        except Exception as e:
            logger.error(f"Failed to check consistency: {e}")
            return {
                "consistency_score": 0.0,
                "contradictions": [],
                "inconsistencies": [],
                "missing_context": [],
                "recommendations": []
            }
    
    async def score_relevance(
        self, 
        query: str, 
        content: str, 
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Score the relevance of content to a query."""
        try:
            start_time = time.time()
            
            relevance_result = await self.rag_pipeline.score_relevance(query, content, context)
            
            processing_time = time.time() - start_time
            logger.info(f"Scored relevance in {processing_time:.2f}s")
            
            return relevance_result
            
        except Exception as e:
            logger.error(f"Failed to score relevance: {e}")
            return {
                "score": 0.0,
                "reasoning": "Relevance scoring failed",
                "raw_response": ""
            }
    
    async def generate_questions(
        self, 
        content: str, 
        num_questions: int = 5
    ) -> List[str]:
        """Generate questions from content."""
        try:
            start_time = time.time()
            
            # Create question generation prompt
            prompt = f"""Based on the following content, generate {num_questions} thoughtful questions that would test understanding:

Content:
{content}

Generate questions that:
- Test comprehension of key concepts
- Require analysis and critical thinking
- Cover different aspects of the content
- Are clear and unambiguous

Questions:"""
            
            result = await self.generate_text(prompt)
            
            # Parse questions from result
            questions = []
            lines = result.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) or 
                           line.startswith(('Q:', 'Question:', '?'))):
                    # Clean up the question
                    question = line
                    for prefix in ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', 'Q:', 'Question:']:
                        if question.startswith(prefix):
                            question = question[len(prefix):].strip()
                            break
                    if question:
                        questions.append(question)
            
            # Limit to requested number
            questions = questions[:num_questions]
            
            processing_time = time.time() - start_time
            logger.info(f"Generated {len(questions)} questions in {processing_time:.2f}s")
            
            return questions
            
        except Exception as e:
            logger.error(f"Failed to generate questions: {e}")
            return []
    
    async def extract_key_points(self, content: str) -> List[str]:
        """Extract key points from content."""
        try:
            start_time = time.time()
            
            prompt = f"""Extract the key points from the following content. List them as clear, concise bullet points:

Content:
{content}

Key Points:"""
            
            result = await self.generate_text(prompt)
            
            # Parse key points
            key_points = []
            lines = result.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith(('-', '•', '*', '1.', '2.', '3.')) or 
                           line.startswith(('Key point:', 'Point:', 'Important:'))):
                    # Clean up the point
                    point = line
                    for prefix in ['-', '•', '*', '1.', '2.', '3.', 'Key point:', 'Point:', 'Important:']:
                        if point.startswith(prefix):
                            point = point[len(prefix):].strip()
                            break
                    if point:
                        key_points.append(point)
            
            processing_time = time.time() - start_time
            logger.info(f"Extracted {len(key_points)} key points in {processing_time:.2f}s")
            
            return key_points
            
        except Exception as e:
            logger.error(f"Failed to extract key points: {e}")
            return []
    
    async def compare_documents(
        self, 
        documents: List[Dict[str, Any]], 
        comparison_criteria: List[str]
    ) -> Dict[str, Any]:
        """Compare multiple documents."""
        try:
            start_time = time.time()
            
            # Prepare document text
            doc_text = "\n\n".join([
                f"Document {i+1}:\n{doc.get('content', '')[:1000]}..."
                for i, doc in enumerate(documents)
            ])
            
            criteria_text = "\n".join([f"- {criterion}" for criterion in comparison_criteria])
            
            prompt = f"""Compare the following documents based on these criteria:

Documents:
{doc_text}

Comparison Criteria:
{criteria_text}

Provide a detailed comparison:"""
            
            result = await self.generate_text(prompt)
            
            processing_time = time.time() - start_time
            logger.info(f"Compared {len(documents)} documents in {processing_time:.2f}s")
            
            return {
                "comparison_result": result,
                "processing_time": processing_time,
                "documents_compared": len(documents)
            }
            
        except Exception as e:
            logger.error(f"Failed to compare documents: {e}")
            return {
                "comparison_result": "Document comparison failed",
                "processing_time": 0.0,
                "documents_compared": 0
            }
    
    async def health_check(self) -> bool:
        """Check if the LLM service is healthy."""
        try:
            # Test with a simple generation
            test_result = await self.generate_text("Test prompt for health check.")
            return len(test_result) > 0
        except Exception as e:
            logger.error(f"LLM health check failed: {e}")
            return False


# Global LLM service instance
llm_service = LLMService()


async def get_llm_service() -> LLMService:
    """Get the global LLM service instance."""
    return llm_service
