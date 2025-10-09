"""
FastAPI dependencies for shared resources and authentication.
Handles database clients, service initialization, and common dependencies.
"""

from typing import AsyncGenerator, Dict, Any
from fastapi import Depends, HTTPException, status
from loguru import logger

from ..services.rag_service import get_rag_service, RAGService
from ..services.llm_service import get_llm_service, LLMService
from ..services.evaluation_pipeline import get_evaluation_pipeline, EvaluationPipeline
from ..utils.vector_db import get_vector_db_client, VectorDBClient
from ..utils.supabase_client import get_supabase_client, SupabaseClient
from ..config import get_settings, Settings


async def get_rag_service_dependency() -> RAGService:
    """Dependency to get RAG service."""
    try:
        return await get_rag_service()
    except Exception as e:
        logger.error(f"Failed to get RAG service: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG service unavailable"
        )


async def get_llm_service_dependency() -> LLMService:
    """Dependency to get LLM service."""
    try:
        return await get_llm_service()
    except Exception as e:
        logger.error(f"Failed to get LLM service: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service unavailable"
        )


async def get_evaluation_pipeline_dependency() -> EvaluationPipeline:
    """Dependency to get evaluation pipeline."""
    try:
        return await get_evaluation_pipeline()
    except Exception as e:
        logger.error(f"Failed to get evaluation pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Evaluation pipeline unavailable"
        )


async def get_vector_db_dependency() -> VectorDBClient:
    """Dependency to get vector database client."""
    try:
        return await get_vector_db_client()
    except Exception as e:
        logger.error(f"Failed to get vector database client: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vector database unavailable"
        )


async def get_supabase_dependency() -> SupabaseClient:
    """Dependency to get Supabase client."""
    try:
        return await get_supabase_client()
    except Exception as e:
        logger.error(f"Failed to get Supabase client: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Document database unavailable"
        )


async def get_settings_dependency() -> Settings:
    """Dependency to get application settings."""
    return get_settings()


async def health_check_dependencies() -> Dict[str, bool]:
    """Check health of all dependencies."""
    try:
        # Check RAG service
        rag_service = await get_rag_service()
        rag_health = await rag_service.health_check()
        
        # Check LLM service
        llm_service = await get_llm_service()
        llm_health = await llm_service.health_check()
        
        # Check vector database
        vector_db = await get_vector_db_client()
        vector_health = await vector_db.health_check()
        
        # Check Supabase
        supabase = await get_supabase_client()
        supabase_health = await supabase.health_check()
        
        return {
            "rag_service": rag_health["overall"],
            "llm_service": llm_health,
            "vector_database": vector_health,
            "document_database": supabase_health,
            "overall": all([
                rag_health["overall"],
                llm_health,
                vector_health,
                supabase_health
            ])
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "rag_service": False,
            "llm_service": False,
            "vector_database": False,
            "document_database": False,
            "overall": False
        }


class ServiceManager:
    """Manages service lifecycle and health checks."""
    
    def __init__(self):
        """Initialize service manager."""
        self.services = {}
        self.health_status = {}
    
    async def initialize_services(self) -> None:
        """Initialize all services."""
        try:
            # Initialize services
            self.services["rag_service"] = await get_rag_service()
            self.services["llm_service"] = await get_llm_service()
            self.services["evaluation_pipeline"] = await get_evaluation_pipeline()
            self.services["vector_db"] = await get_vector_db_client()
            self.services["supabase"] = await get_supabase_client()
            
            logger.info("All services initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
            raise
    
    async def check_health(self) -> Dict[str, bool]:
        """Check health of all services."""
        try:
            health_results = {}
            
            # Check each service
            for service_name, service in self.services.items():
                try:
                    if hasattr(service, 'health_check'):
                        health_results[service_name] = await service.health_check()
                    else:
                        health_results[service_name] = True
                except Exception as e:
                    logger.error(f"Health check failed for {service_name}: {e}")
                    health_results[service_name] = False
            
            # Overall health
            health_results["overall"] = all(health_results.values())
            self.health_status = health_results
            
            return health_results
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"overall": False}
    
    async def get_service_stats(self) -> Dict[str, Any]:
        """Get statistics from all services."""
        try:
            stats = {}
            
            for service_name, service in self.services.items():
                try:
                    if hasattr(service, 'get_system_stats'):
                        stats[service_name] = await service.get_system_stats()
                    elif hasattr(service, 'get_pipeline_stats'):
                        stats[service_name] = await service.get_pipeline_stats()
                    else:
                        stats[service_name] = {"status": "operational"}
                except Exception as e:
                    logger.error(f"Failed to get stats for {service_name}: {e}")
                    stats[service_name] = {"status": "error", "error": str(e)}
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get service stats: {e}")
            return {}


# Global service manager
service_manager = ServiceManager()


async def get_service_manager() -> ServiceManager:
    """Get the global service manager."""
    return service_manager


# Common dependency combinations
async def get_all_services(
    rag_service: RAGService = Depends(get_rag_service_dependency),
    llm_service: LLMService = Depends(get_llm_service_dependency),
    evaluation_pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline_dependency)
) -> Dict[str, Any]:
    """Get all services as a dependency."""
    return {
        "rag_service": rag_service,
        "llm_service": llm_service,
        "evaluation_pipeline": evaluation_pipeline
    }


async def get_database_services(
    vector_db: VectorDBClient = Depends(get_vector_db_dependency),
    supabase: SupabaseClient = Depends(get_supabase_dependency)
) -> Dict[str, Any]:
    """Get database services as a dependency."""
    return {
        "vector_db": vector_db,
        "supabase": supabase
    }


# Error handling dependencies
async def validate_request_size(content: str, max_size: int = 10000) -> str:
    """Validate request content size."""
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Request content too large. Maximum size: {max_size} characters"
        )
    return content


async def validate_query_length(query: str, min_length: int = 1, max_length: int = 1000) -> str:
    """Validate query length."""
    if len(query) < min_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query too short. Minimum length: {min_length} characters"
        )
    if len(query) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query too long. Maximum length: {max_length} characters"
        )
    return query


# Rate limiting dependencies (placeholder for future implementation)
async def check_rate_limit(user_id: str = None) -> bool:
    """Check rate limit for user (placeholder implementation)."""
    # In production, implement actual rate limiting
    return True


# Authentication dependencies (placeholder for future implementation)
async def get_current_user(token: str = None) -> Dict[str, Any]:
    """Get current user from token (placeholder implementation)."""
    # In production, implement actual authentication
    return {"user_id": "anonymous", "permissions": ["read", "write"]}
