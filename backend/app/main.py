"""
FastAPI main application with RAG evaluation endpoints.
Configures CORS, middleware, and includes all routes.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import uvicorn

from .config import get_settings
from .api.routes import router
from .api.dependencies import get_service_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting RAG Evaluation API...")
    
    try:
        # Initialize services
        service_manager = await get_service_manager()
        await service_manager.initialize_services()
        
        # Check health
        health_status = await service_manager.check_health()
        if not health_status.get("overall", False):
            logger.warning("Some services are not healthy at startup")
        
        logger.info("RAG Evaluation API started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down RAG Evaluation API...")


# Create FastAPI application
app = FastAPI(
    title="RAG Evaluation API",
    description="A comprehensive RAG (Retrieval-Augmented Generation) API with Llama 3.2 evaluation capabilities",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred",
            "timestamp": "2024-01-01T00:00:00Z"  # Would use actual timestamp in production
        }
    )


# Include API routes
app.include_router(router, prefix="/api/v1")


# Health check endpoint (separate from API routes)
@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "RAG Evaluation API"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RAG Evaluation API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info("Application startup completed")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Application shutdown completed")


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
