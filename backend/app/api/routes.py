"""
FastAPI routes for RAG evaluation API.
Defines all endpoints for document retrieval, evaluation, and system management.
"""

import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from loguru import logger

from ..models.schemas import (
    RAGQueryRequest, RAGQueryResponse, DocumentEvaluationRequest, DocumentEvaluationResponse,
    HealthCheckResponse, MetricsResponse, ErrorResponse, BatchRAGRequest, BatchRAGResponse,
    DocumentUploadRequest, DocumentUploadResponse, AdvancedRAGRequest, SearchFilters
)
from ..api.dependencies import (
    get_rag_service_dependency, get_llm_service_dependency, get_evaluation_pipeline_dependency,
    get_vector_db_dependency, get_supabase_dependency, get_settings_dependency,
    health_check_dependencies, get_all_services, get_database_services,
    validate_query_length, validate_request_size, get_service_manager
)
from ..services.rag_service import RAGService
from ..services.llm_service import LLMService
from ..services.evaluation_pipeline import EvaluationPipeline
from ..utils.vector_db import VectorDBClient
from ..utils.supabase_client import SupabaseClient
from ..config import Settings

# Create router
router = APIRouter()


@router.post("/rag/query", response_model=RAGQueryResponse)
async def rag_query(
    request: RAGQueryRequest,
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> RAGQueryResponse:
    """Process a RAG query with optional evaluation."""
    try:
        # Validate query
        validated_query = await validate_query_length(request.query)
        
        # Process the query
        response = await evaluation_pipeline.process_rag_query(request)
        
        logger.info(f"Processed RAG query: {validated_query[:50]}...")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process RAG query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process RAG query"
        )


@router.post("/rag/evaluate", response_model=DocumentEvaluationResponse)
async def evaluate_document(
    request: DocumentEvaluationRequest,
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> DocumentEvaluationResponse:
    """Evaluate a document using LLM."""
    try:
        # Validate content size
        validated_content = await validate_request_size(request.document_content)
        request.document_content = validated_content
        
        # Process evaluation
        response = await evaluation_pipeline.evaluate_document(request)
        
        logger.info(f"Evaluated document of length: {len(validated_content)}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to evaluate document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate document"
        )


@router.post("/rag/batch", response_model=BatchRAGResponse)
async def batch_rag_query(
    request: BatchRAGRequest,
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> BatchRAGResponse:
    """Process multiple RAG queries in batch."""
    try:
        # Validate all queries
        validated_queries = []
        for query in request.queries:
            validated_query = await validate_query_length(query)
            validated_queries.append(validated_query)
        
        # Update request with validated queries
        request.queries = validated_queries
        
        # Process batch
        response = await evaluation_pipeline.process_batch_rag(request)
        
        logger.info(f"Processed batch RAG with {len(validated_queries)} queries")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process batch RAG: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process batch RAG"
        )


@router.post("/rag/advanced", response_model=RAGQueryResponse)
async def advanced_rag_query(
    request: AdvancedRAGRequest,
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> RAGQueryResponse:
    """Process advanced RAG query with filters and reranking."""
    try:
        # Validate query
        validated_query = await validate_query_length(request.query)
        request.query = validated_query
        
        # Process advanced query
        response = await evaluation_pipeline.process_advanced_rag(request)
        
        logger.info(f"Processed advanced RAG query: {validated_query[:50]}...")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process advanced RAG: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process advanced RAG"
        )


@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    request: DocumentUploadRequest,
    rag_service: RAGService = Depends(get_rag_service_dependency)
) -> DocumentUploadResponse:
    """Upload and index a new document."""
    try:
        # Validate content size
        validated_content = await validate_request_size(request.content)
        
        # Upload document
        document_id = await rag_service.upload_document(
            content=validated_content,
            metadata=request.metadata,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap
        )
        
        logger.info(f"Uploaded document: {document_id}")
        return DocumentUploadResponse(
            document_id=document_id,
            chunks_created=len(validated_content) // request.chunk_size + 1,
            processing_time=0.0,  # Will be calculated by service
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    rag_service: RAGService = Depends(get_rag_service_dependency)
) -> Dict[str, Any]:
    """Delete a document and its vectors."""
    try:
        success = await rag_service.delete_document(document_id)
        
        if success:
            logger.info(f"Deleted document: {document_id}")
            return {"message": f"Document {document_id} deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )


@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    rag_service: RAGService = Depends(get_rag_service_dependency)
) -> Dict[str, Any]:
    """Get a document by ID."""
    try:
        document = await rag_service.get_document_by_id(document_id)
        
        if document:
            return document
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get document"
        )


@router.post("/documents/{document_id}/reindex")
async def reindex_document(
    document_id: str,
    rag_service: RAGService = Depends(get_rag_service_dependency)
) -> Dict[str, Any]:
    """Reindex a document."""
    try:
        success = await rag_service.reindex_document(document_id)
        
        if success:
            logger.info(f"Reindexed document: {document_id}")
            return {"message": f"Document {document_id} reindexed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to reindex document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reindex document"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check(
    service_manager: ServiceManager = Depends(get_service_manager)
) -> HealthCheckResponse:
    """Check system health."""
    try:
        # Check health of all services
        health_status = await service_manager.check_health()
        
        # Get service status
        services = {
            "rag_service": "healthy" if health_status.get("rag_service", False) else "unhealthy",
            "llm_service": "healthy" if health_status.get("llm_service", False) else "unhealthy",
            "vector_database": "healthy" if health_status.get("vector_database", False) else "unhealthy",
            "document_database": "healthy" if health_status.get("document_database", False) else "unhealthy"
        }
        
        overall_status = "healthy" if health_status.get("overall", False) else "unhealthy"
        
        return HealthCheckResponse(
            status=overall_status,
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services=services
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthCheckResponse(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services={
                "rag_service": "unhealthy",
                "llm_service": "unhealthy",
                "vector_database": "unhealthy",
                "document_database": "unhealthy"
            }
        )


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(
    service_manager: ServiceManager = Depends(get_service_manager)
) -> MetricsResponse:
    """Get system metrics and statistics."""
    try:
        # Get service statistics
        stats = await service_manager.get_service_stats()
        
        # Extract metrics
        rag_stats = stats.get("rag_service", {})
        vector_stats = rag_stats.get("vector_database", {})
        doc_stats = rag_stats.get("document_database", {})
        
        return MetricsResponse(
            total_queries=0,  # Would be tracked in production
            average_processing_time=0.0,  # Would be calculated in production
            documents_indexed=doc_stats.get("total_documents", 0),
            evaluation_stats={
                "total_evaluations": 0,  # Would be tracked in production
                "average_score": 0.0  # Would be calculated in production
            },
            uptime=0.0  # Would be calculated in production
        )
        
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get metrics"
        )


@router.get("/insights/{query}")
async def get_insights(
    query: str,
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> Dict[str, Any]:
    """Get insights from a query."""
    try:
        # Validate query
        validated_query = await validate_query_length(query)
        
        # Create a simple RAG request
        rag_request = RAGQueryRequest(
            query=validated_query,
            top_k=5,
            include_evaluation=False
        )
        
        # Process query
        rag_response = await evaluation_pipeline.process_rag_query(rag_request)
        
        # Generate insights
        insights = await evaluation_pipeline.generate_insights(
            query=validated_query,
            documents=rag_response.retrieved_documents
        )
        
        return insights
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get insights"
        )


@router.post("/compare")
async def compare_documents(
    document_ids: List[str],
    comparison_criteria: List[str],
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency),
    rag_service: RAGService = Depends(get_rag_service_dependency)
) -> Dict[str, Any]:
    """Compare multiple documents."""
    try:
        # Get documents
        documents = []
        for doc_id in document_ids:
            doc = await rag_service.get_document_by_id(doc_id)
            if doc:
                # Convert to RetrievedDocument format
                from ..models.schemas import RetrievedDocument, DocumentMetadata
                metadata = DocumentMetadata(
                    id=doc["id"],
                    title=doc.get("title"),
                    source=doc.get("source"),
                    author=doc.get("author"),
                    created_at=doc.get("created_at"),
                    updated_at=doc.get("updated_at"),
                    tags=doc.get("tags", []),
                    category=doc.get("category")
                )
                
                retrieved_doc = RetrievedDocument(
                    id=doc["id"],
                    content=doc.get("content", ""),
                    metadata=metadata,
                    similarity_score=1.0
                )
                documents.append(retrieved_doc)
        
        if not documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No documents found"
            )
        
        # Compare documents
        comparison_result = await evaluation_pipeline.compare_documents(
            documents=documents,
            comparison_criteria=comparison_criteria
        )
        
        return comparison_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to compare documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare documents"
        )


@router.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with API information."""
    return {
        "message": "RAG Evaluation API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "rag_query": "/rag/query",
            "evaluate_document": "/rag/evaluate",
            "batch_rag": "/rag/batch",
            "advanced_rag": "/rag/advanced",
            "upload_document": "/documents/upload",
            "health_check": "/health",
            "metrics": "/metrics",
            "insights": "/insights/{query}",
            "compare_documents": "/compare"
        }
    }
