"""
End-to-end RAG evaluation pipeline.
Combines retrieval, generation, and evaluation for comprehensive document analysis.
"""

import asyncio
import time
from typing import List, Dict, Any, Optional, Tuple
from loguru import logger

from ..services.rag_service import get_rag_service
from ..services.llm_service import get_llm_service
from ..models.schemas import (
    RAGQueryRequest, RAGQueryResponse, RetrievedDocument, EvaluationResult,
    DocumentEvaluationRequest, DocumentEvaluationResponse, BatchRAGRequest, BatchRAGResponse,
    AdvancedRAGRequest, SearchFilters
)


class EvaluationPipeline:
    """End-to-end evaluation pipeline for RAG operations."""
    
    def __init__(self):
        """Initialize the evaluation pipeline."""
        self.rag_service = None
        self.llm_service = None
        self._initialize_services()
    
    def _initialize_services(self) -> None:
        """Initialize required services."""
        try:
            self.rag_service = get_rag_service()
            self.llm_service = get_llm_service()
            logger.info("Evaluation pipeline initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize evaluation pipeline: {e}")
            raise
    
    async def process_rag_query(self, request: RAGQueryRequest) -> RAGQueryResponse:
        """Process a RAG query with optional evaluation."""
        try:
            start_time = time.time()
            
            # Prepare search filters if needed
            filters = None
            if hasattr(request, 'filters') and request.filters:
                filters = request.filters
            
            # Retrieve documents
            retrieved_docs = await self.rag_service.retrieve_documents(
                query=request.query,
                top_k=request.top_k,
                similarity_threshold=request.similarity_threshold,
                filters=filters
            )
            
            evaluation = None
            if request.include_evaluation and retrieved_docs:
                # Perform evaluation on retrieved documents
                evaluation = await self._evaluate_retrieved_documents(
                    query=request.query,
                    documents=retrieved_docs,
                    criteria=request.evaluation_criteria
                )
            
            processing_time = time.time() - start_time
            
            return RAGQueryResponse(
                query=request.query,
                retrieved_documents=retrieved_docs,
                evaluation=evaluation,
                processing_time=processing_time,
                total_documents_found=len(retrieved_docs)
            )
            
        except Exception as e:
            logger.error(f"Failed to process RAG query: {e}")
            raise
    
    async def _evaluate_retrieved_documents(
        self, 
        query: str, 
        documents: List[RetrievedDocument],
        criteria: Optional[List[str]] = None
    ) -> EvaluationResult:
        """Evaluate retrieved documents."""
        try:
            # Combine document contents for evaluation
            combined_content = "\n\n".join([
                f"Document {i+1} (Score: {doc.similarity_score:.3f}):\n{doc.content}"
                for i, doc in enumerate(documents)
            ])
            
            # Create context from query
            context = f"Query: {query}\n\nRetrieved {len(documents)} documents for evaluation."
            
            # Perform evaluation
            evaluation_result = await self.llm_service.evaluate_document(
                content=combined_content,
                criteria=criteria,
                context=context
            )
            
            # Add consistency check if multiple documents
            if len(documents) > 1:
                consistency_result = await self.llm_service.check_consistency(
                    main_content=documents[0].content,
                    reference_documents=[
                        {"content": doc.content, "metadata": doc.metadata.dict()}
                        for doc in documents[1:]
                    ]
                )
                
                # Merge consistency issues
                evaluation_result.consistency_issues.extend(
                    consistency_result.get("contradictions", []) + 
                    consistency_result.get("inconsistencies", [])
                )
            
            return evaluation_result
            
        except Exception as e:
            logger.error(f"Failed to evaluate retrieved documents: {e}")
            # Return default evaluation
            return EvaluationResult(
                overall_score=5.0,
                criterion_scores=[],
                summary="Evaluation failed due to an error.",
                strengths=[],
                weaknesses=["Evaluation service unavailable"],
                recommendations=["Please try again later"],
                consistency_issues=[],
                missing_information=[]
            )
    
    async def evaluate_document(self, request: DocumentEvaluationRequest) -> DocumentEvaluationResponse:
        """Evaluate a single document."""
        try:
            start_time = time.time()
            
            # Prepare context
            context = request.context or "No additional context provided."
            if request.document_metadata:
                context += f"\n\nDocument metadata: {request.document_metadata.dict()}"
            
            # Perform evaluation
            evaluation_result = await self.llm_service.evaluate_document(
                content=request.document_content,
                criteria=request.evaluation_criteria,
                context=context
            )
            
            processing_time = time.time() - start_time
            
            return DocumentEvaluationResponse(
                evaluation=evaluation_result,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Failed to evaluate document: {e}")
            raise
    
    async def process_batch_rag(self, request: BatchRAGRequest) -> BatchRAGResponse:
        """Process multiple RAG queries in batch."""
        try:
            start_time = time.time()
            results = []
            successful_queries = 0
            failed_queries = 0
            
            # Process each query
            for query in request.queries:
                try:
                    # Create individual request
                    individual_request = RAGQueryRequest(
                        query=query,
                        top_k=request.top_k,
                        similarity_threshold=request.similarity_threshold,
                        include_evaluation=request.include_evaluation
                    )
                    
                    # Process query
                    result = await self.process_rag_query(individual_request)
                    results.append(result)
                    successful_queries += 1
                    
                except Exception as e:
                    logger.error(f"Failed to process query '{query}': {e}")
                    failed_queries += 1
                    
                    # Add failed result
                    results.append(RAGQueryResponse(
                        query=query,
                        retrieved_documents=[],
                        evaluation=None,
                        processing_time=0.0,
                        total_documents_found=0
                    ))
            
            total_processing_time = time.time() - start_time
            
            return BatchRAGResponse(
                results=results,
                total_processing_time=total_processing_time,
                successful_queries=successful_queries,
                failed_queries=failed_queries
            )
            
        except Exception as e:
            logger.error(f"Failed to process batch RAG: {e}")
            raise
    
    async def process_advanced_rag(self, request: AdvancedRAGRequest) -> RAGQueryResponse:
        """Process advanced RAG query with filters and reranking."""
        try:
            start_time = time.time()
            
            # Retrieve documents with filters
            retrieved_docs = await self.rag_service.search_documents(
                query=request.query,
                filters=request.filters,
                top_k=request.top_k,
                similarity_threshold=request.similarity_threshold
            )
            
            # Rerank if requested
            if request.rerank and retrieved_docs:
                retrieved_docs = await self._rerank_documents(
                    query=request.query,
                    documents=retrieved_docs
                )
            
            evaluation = None
            if request.include_evaluation and retrieved_docs:
                # Perform evaluation
                evaluation = await self._evaluate_retrieved_documents(
                    query=request.query,
                    documents=retrieved_docs,
                    criteria=request.evaluation_criteria
                )
            
            processing_time = time.time() - start_time
            
            return RAGQueryResponse(
                query=request.query,
                retrieved_documents=retrieved_docs,
                evaluation=evaluation,
                processing_time=processing_time,
                total_documents_found=len(retrieved_docs)
            )
            
        except Exception as e:
            logger.error(f"Failed to process advanced RAG: {e}")
            raise
    
    async def _rerank_documents(
        self, 
        query: str, 
        documents: List[RetrievedDocument]
    ) -> List[RetrievedDocument]:
        """Rerank documents using LLM-based relevance scoring."""
        try:
            # Score each document for relevance
            scored_docs = []
            for doc in documents:
                relevance_result = await self.llm_service.score_relevance(
                    query=query,
                    content=doc.content,
                    context=f"Document from {doc.metadata.source or 'unknown source'}"
                )
                
                # Combine similarity score with relevance score
                combined_score = (doc.similarity_score + relevance_result["score"] / 10.0) / 2.0
                
                scored_docs.append((doc, combined_score))
            
            # Sort by combined score
            scored_docs.sort(key=lambda x: x[1], reverse=True)
            
            # Return reranked documents
            return [doc for doc, score in scored_docs]
            
        except Exception as e:
            logger.error(f"Failed to rerank documents: {e}")
            return documents  # Return original order on failure
    
    async def generate_insights(
        self, 
        query: str, 
        documents: List[RetrievedDocument]
    ) -> Dict[str, Any]:
        """Generate insights from retrieved documents."""
        try:
            start_time = time.time()
            
            # Extract key points from all documents
            all_content = "\n\n".join([doc.content for doc in documents])
            key_points = await self.llm_service.extract_key_points(all_content)
            
            # Generate questions
            questions = await self.llm_service.generate_questions(all_content, num_questions=5)
            
            # Create summary
            summary = await self.llm_service.summarize_text(all_content, max_length=300)
            
            processing_time = time.time() - start_time
            
            return {
                "summary": summary,
                "key_points": key_points,
                "questions": questions,
                "document_count": len(documents),
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Failed to generate insights: {e}")
            return {
                "summary": "Failed to generate insights",
                "key_points": [],
                "questions": [],
                "document_count": len(documents),
                "processing_time": 0.0
            }
    
    async def compare_documents(
        self, 
        documents: List[RetrievedDocument],
        comparison_criteria: List[str]
    ) -> Dict[str, Any]:
        """Compare multiple documents."""
        try:
            start_time = time.time()
            
            # Prepare documents for comparison
            doc_data = [
                {
                    "content": doc.content,
                    "metadata": doc.metadata.dict(),
                    "similarity_score": doc.similarity_score
                }
                for doc in documents
            ]
            
            # Perform comparison
            comparison_result = await self.llm_service.compare_documents(
                documents=doc_data,
                comparison_criteria=comparison_criteria
            )
            
            processing_time = time.time() - start_time
            
            return {
                "comparison_result": comparison_result["comparison_result"],
                "documents_compared": len(documents),
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Failed to compare documents: {e}")
            return {
                "comparison_result": "Document comparison failed",
                "documents_compared": len(documents),
                "processing_time": 0.0
            }
    
    async def health_check(self) -> Dict[str, bool]:
        """Check health of all pipeline components."""
        try:
            rag_health = await self.rag_service.health_check()
            llm_health = await self.llm_service.health_check()
            
            return {
                "rag_service": rag_health["overall"],
                "llm_service": llm_health,
                "overall": rag_health["overall"] and llm_health
            }
            
        except Exception as e:
            logger.error(f"Pipeline health check failed: {e}")
            return {
                "rag_service": False,
                "llm_service": False,
                "overall": False
            }
    
    async def get_pipeline_stats(self) -> Dict[str, Any]:
        """Get pipeline statistics."""
        try:
            # Get RAG service stats
            rag_stats = await self.rag_service.get_system_stats()
            
            return {
                "rag_service": rag_stats,
                "pipeline_status": "operational"
            }
            
        except Exception as e:
            logger.error(f"Failed to get pipeline stats: {e}")
            return {
                "rag_service": {},
                "pipeline_status": "error"
            }


# Global evaluation pipeline instance
evaluation_pipeline = EvaluationPipeline()


async def get_evaluation_pipeline() -> EvaluationPipeline:
    """Get the global evaluation pipeline instance."""
    return evaluation_pipeline
