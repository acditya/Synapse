"""
Configuration settings for the RAG FastAPI backend.
Handles environment variables, API keys, and model parameters.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    app_name: str = "RAG Evaluation API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # Supabase Configuration
    supabase_url: str = Field(env="SUPABASE_URL")
    supabase_key: str = Field(env="SUPABASE_ANON_KEY")
    supabase_service_key: Optional[str] = Field(default=None, env="SUPABASE_SERVICE_KEY")
    
    # Pinecone Configuration
    pinecone_api_key: str = Field(env="PINECONE_API_KEY")
    pinecone_environment: str = Field(default="us-west1-gcp", env="PINECONE_ENVIRONMENT")
    pinecone_index_name: str = Field(default="rag-documents", env="PINECONE_INDEX_NAME")
    
    # Llama 3.2 Configuration
    llama_model_path: str = Field(env="LLAMA_MODEL_PATH")
    llama_n_ctx: int = Field(default=4096, env="LLAMA_N_CTX")
    llama_n_gpu_layers: int = Field(default=0, env="LLAMA_N_GPU_LAYERS")
    llama_temperature: float = Field(default=0.7, env="LLAMA_TEMPERATURE")
    llama_max_tokens: int = Field(default=2048, env="LLAMA_MAX_TOKENS")
    
    # Embedding Configuration
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDING_MODEL")
    embedding_dimension: int = Field(default=384, env="EMBEDDING_DIMENSION")
    
    # RAG Configuration
    retrieval_top_k: int = Field(default=5, env="RETRIEVAL_TOP_K")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    max_context_length: int = Field(default=4000, env="MAX_CONTEXT_LENGTH")
    
    # Evaluation Configuration
    evaluation_criteria: list[str] = Field(
        default=[
            "relevance",
            "accuracy", 
            "completeness",
            "consistency",
            "clarity"
        ],
        env="EVALUATION_CRITERIA"
    )
    
    # Logging Configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")
    
    # CORS Configuration
    cors_origins: list[str] = Field(default=["*"], env="CORS_ORIGINS")
    cors_methods: list[str] = Field(default=["GET", "POST", "PUT", "DELETE"], env="CORS_METHODS")
    cors_headers: list[str] = Field(default=["*"], env="CORS_HEADERS")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings


# Model-specific configurations
LLAMA_CONFIG = {
    "model_path": settings.llama_model_path,
    "n_ctx": settings.llama_n_ctx,
    "n_gpu_layers": settings.llama_n_gpu_layers,
    "temperature": settings.llama_temperature,
    "max_tokens": settings.llama_max_tokens,
    "verbose": settings.debug
}

PINECONE_CONFIG = {
    "api_key": settings.pinecone_api_key,
    "environment": settings.pinecone_environment,
    "index_name": settings.pinecone_index_name
}

SUPABASE_CONFIG = {
    "url": settings.supabase_url,
    "key": settings.supabase_key,
    "service_key": settings.supabase_service_key
}
