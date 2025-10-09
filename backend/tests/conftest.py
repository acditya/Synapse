"""
Pytest configuration and fixtures for RAG evaluation API tests.
Provides test fixtures for services, clients, and mock data.
"""

import pytest
import asyncio
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.models.schemas import (
    DocumentMetadata, RetrievedDocument, RAGQueryRequest, DocumentEvaluationRequest,
    EvaluationResult, EvaluationScore, EvaluationCriteria
)
from app.services.rag_service import RAGService
from app.services.llm_service import LLMService
from app.services.evaluation_pipeline import EvaluationPipeline
from app.utils.vector_db import VectorDBClient
from app.utils.supabase_client import SupabaseClient


@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_vector_db_client():
    """Mock vector database client."""
    client = AsyncMock(spec=VectorDBClient)
    
    # Mock methods
    client.embed_text.return_value = [0.1] * 384  # Mock embedding
    client.embed_texts.return_value = [[0.1] * 384] * 3  # Mock embeddings
    client.search_similar.return_value = [
        {
            "id": "doc1_chunk_0",
            "score": 0.85,
            "metadata": {
                "content": "Test document content",
                "document_id": "doc1",
                "chunk_index": 0
            }
        }
    ]
    client.upsert_vectors.return_value = None
    client.delete_vectors.return_value = None
    client.get_index_stats.return_value = {
        "total_vector_count": 100,
        "dimension": 384,
        "index_fullness": 0.1,
        "namespaces": {}
    }
    client.health_check.return_value = True
    
    return client


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client."""
    client = AsyncMock(spec=SupabaseClient)
    
    # Mock methods
    client.store_document.return_value = "doc1"
    client.get_document.return_value = {
        "id": "doc1",
        "title": "Test Document",
        "source": "test_source",
        "author": "test_author",
        "content": "Test document content",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "tags": ["test"],
        "category": "test_category"
    }
    client.get_document_chunks.return_value = [
        {
            "document_id": "doc1",
            "chunk_index": 0,
            "content": "Test chunk content",
            "metadata": {},
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    client.search_documents.return_value = [
        {
            "id": "doc1",
            "title": "Test Document",
            "source": "test_source",
            "author": "test_author",
            "content": "Test document content",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "tags": ["test"],
            "category": "test_category"
        }
    ]
    client.update_document_metadata.return_value = True
    client.delete_document.return_value = True
    client.get_document_stats.return_value = {
        "total_documents": 10,
        "total_chunks": 30,
        "category_distribution": {"test": 10}
    }
    client.health_check.return_value = True
    
    return client


@pytest.fixture
def mock_llm_service():
    """Mock LLM service."""
    service = AsyncMock(spec=LLMService)
    
    # Mock methods
    service.generate_text.return_value = "Generated text response"
    service.summarize_text.return_value = "Document summary"
    service.evaluate_document.return_value = EvaluationResult(
        overall_score=8.5,
        criterion_scores=[
            EvaluationScore(
                criterion=EvaluationCriteria.RELEVANCE,
                score=8.0,
                reasoning="Highly relevant to the query"
            ),
            EvaluationScore(
                criterion=EvaluationCriteria.ACCURACY,
                score=9.0,
                reasoning="Accurate information"
            )
        ],
        summary="Overall good document with high relevance and accuracy",
        strengths=["Clear structure", "Accurate data"],
        weaknesses=["Could be more detailed"],
        recommendations=["Add more examples"],
        consistency_issues=[],
        missing_information=[]
    )
    service.check_consistency.return_value = {
        "consistency_score": 8.0,
        "contradictions": [],
        "inconsistencies": [],
        "missing_context": [],
        "recommendations": []
    }
    service.score_relevance.return_value = {
        "score": 8.5,
        "reasoning": "Highly relevant to the query",
        "raw_response": "Relevance analysis"
    }
    service.generate_questions.return_value = [
        "What is the main topic?",
        "What are the key findings?",
        "How does this relate to other research?"
    ]
    service.extract_key_points.return_value = [
        "Key point 1",
        "Key point 2",
        "Key point 3"
    ]
    service.compare_documents.return_value = {
        "comparison_result": "Document comparison analysis",
        "documents_compared": 2,
        "processing_time": 1.5
    }
    service.health_check.return_value = True
    
    return service


@pytest.fixture
def mock_rag_service(mock_vector_db_client, mock_supabase_client):
    """Mock RAG service."""
    service = AsyncMock(spec=RAGService)
    
    # Mock methods
    service.retrieve_documents.return_value = [
        RetrievedDocument(
            id="doc1_chunk_0",
            content="Test document content",
            metadata=DocumentMetadata(
                id="doc1",
                title="Test Document",
                source="test_source",
                author="test_author",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                tags=["test"],
                category="test_category"
            ),
            similarity_score=0.85,
            chunk_index=0
        )
    ]
    service.upload_document.return_value = "doc1"
    service.delete_document.return_value = True
    service.get_document_by_id.return_value = {
        "id": "doc1",
        "title": "Test Document",
        "source": "test_source",
        "author": "test_author",
        "content": "Test document content",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "tags": ["test"],
        "category": "test_category"
    }
    service.update_document_metadata.return_value = True
    service.search_documents.return_value = [
        RetrievedDocument(
            id="doc1_chunk_0",
            content="Test document content",
            metadata=DocumentMetadata(
                id="doc1",
                title="Test Document",
                source="test_source",
                author="test_author",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                tags=["test"],
                category="test_category"
            ),
            similarity_score=0.85,
            chunk_index=0
        )
    ]
    service.get_system_stats.return_value = {
        "vector_database": {"total_vector_count": 100},
        "document_database": {"total_documents": 10},
        "total_vectors": 100,
        "total_documents": 10,
        "total_chunks": 30
    }
    service.health_check.return_value = {
        "vector_database": True,
        "document_database": True,
        "overall": True
    }
    service.reindex_document.return_value = True
    service.batch_upload_documents.return_value = ["doc1", "doc2", "doc3"]
    
    return service


@pytest.fixture
def mock_evaluation_pipeline(mock_rag_service, mock_llm_service):
    """Mock evaluation pipeline."""
    service = AsyncMock(spec=EvaluationPipeline)
    
    # Mock methods
    service.process_rag_query.return_value = {
        "query": "test query",
        "retrieved_documents": [
            RetrievedDocument(
                id="doc1_chunk_0",
                content="Test document content",
                metadata=DocumentMetadata(
                    id="doc1",
                    title="Test Document",
                    source="test_source",
                    author="test_author",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    tags=["test"],
                    category="test_category"
                ),
                similarity_score=0.85,
                chunk_index=0
            )
        ],
        "evaluation": EvaluationResult(
            overall_score=8.5,
            criterion_scores=[
                EvaluationScore(
                    criterion=EvaluationCriteria.RELEVANCE,
                    score=8.0,
                    reasoning="Highly relevant"
                )
            ],
            summary="Good document",
            strengths=["Clear"],
            weaknesses=["Could be better"],
            recommendations=["Improve"],
            consistency_issues=[],
            missing_information=[]
        ),
        "processing_time": 1.5,
        "total_documents_found": 1
    }
    service.evaluate_document.return_value = {
        "evaluation": EvaluationResult(
            overall_score=8.5,
            criterion_scores=[],
            summary="Good document",
            strengths=[],
            weaknesses=[],
            recommendations=[],
            consistency_issues=[],
            missing_information=[]
        ),
        "processing_time": 1.0
    }
    service.process_batch_rag.return_value = {
        "results": [],
        "total_processing_time": 5.0,
        "successful_queries": 3,
        "failed_queries": 0
    }
    service.process_advanced_rag.return_value = {
        "query": "test query",
        "retrieved_documents": [],
        "evaluation": None,
        "processing_time": 2.0,
        "total_documents_found": 0
    }
    service.generate_insights.return_value = {
        "summary": "Document summary",
        "key_points": ["Point 1", "Point 2"],
        "questions": ["Question 1", "Question 2"],
        "document_count": 1,
        "processing_time": 1.0
    }
    service.compare_documents.return_value = {
        "comparison_result": "Comparison analysis",
        "documents_compared": 2,
        "processing_time": 1.5
    }
    service.health_check.return_value = {
        "rag_service": True,
        "llm_service": True,
        "overall": True
    }
    service.get_pipeline_stats.return_value = {
        "rag_service": {"status": "operational"},
        "pipeline_status": "operational"
    }
    
    return service


@pytest.fixture
def sample_document_metadata():
    """Sample document metadata for testing."""
    return DocumentMetadata(
        id="test_doc_1",
        title="Test Document",
        source="test_source",
        author="test_author",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        tags=["test", "example"],
        category="test_category"
    )


@pytest.fixture
def sample_rag_query_request():
    """Sample RAG query request for testing."""
    return RAGQueryRequest(
        query="What is machine learning?",
        top_k=5,
        similarity_threshold=0.7,
        include_evaluation=True,
        evaluation_criteria=[EvaluationCriteria.RELEVANCE, EvaluationCriteria.ACCURACY]
    )


@pytest.fixture
def sample_document_evaluation_request():
    """Sample document evaluation request for testing."""
    return DocumentEvaluationRequest(
        document_content="This is a test document about machine learning algorithms and their applications in various domains.",
        document_metadata=DocumentMetadata(
            id="test_doc_1",
            title="Test Document",
            source="test_source",
            author="test_author",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            tags=["test", "ml"],
            category="technology"
        ),
        evaluation_criteria=[EvaluationCriteria.RELEVANCE, EvaluationCriteria.ACCURACY],
        context="Testing document evaluation functionality"
    )


@pytest.fixture
def sample_batch_rag_request():
    """Sample batch RAG request for testing."""
    return {
        "queries": [
            "What is machine learning?",
            "How does deep learning work?",
            "What are neural networks?"
        ],
        "top_k": 3,
        "similarity_threshold": 0.7,
        "include_evaluation": True
    }


@pytest.fixture
def sample_retrieved_documents():
    """Sample retrieved documents for testing."""
    return [
        RetrievedDocument(
            id="doc1_chunk_0",
            content="Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models.",
            metadata=DocumentMetadata(
                id="doc1",
                title="Introduction to Machine Learning",
                source="ml_textbook",
                author="AI Researcher",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                tags=["ml", "ai"],
                category="technology"
            ),
            similarity_score=0.92,
            chunk_index=0
        ),
        RetrievedDocument(
            id="doc2_chunk_0",
            content="Deep learning is a subset of machine learning that uses neural networks with multiple layers.",
            metadata=DocumentMetadata(
                id="doc2",
                title="Deep Learning Fundamentals",
                source="dl_handbook",
                author="DL Expert",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                tags=["dl", "neural_networks"],
                category="technology"
            ),
            similarity_score=0.88,
            chunk_index=0
        )
    ]


@pytest.fixture
def sample_evaluation_result():
    """Sample evaluation result for testing."""
    return EvaluationResult(
        overall_score=8.5,
        criterion_scores=[
            EvaluationScore(
                criterion=EvaluationCriteria.RELEVANCE,
                score=9.0,
                reasoning="Highly relevant to machine learning topic"
            ),
            EvaluationScore(
                criterion=EvaluationCriteria.ACCURACY,
                score=8.0,
                reasoning="Accurate information with good examples"
            ),
            EvaluationScore(
                criterion=EvaluationCriteria.COMPLETENESS,
                score=8.5,
                reasoning="Covers main concepts but could be more comprehensive"
            ),
            EvaluationScore(
                criterion=EvaluationCriteria.CONSISTENCY,
                score=9.0,
                reasoning="Consistent throughout the document"
            ),
            EvaluationScore(
                criterion=EvaluationCriteria.CLARITY,
                score=8.0,
                reasoning="Clear and well-structured"
            )
        ],
        summary="This document provides a comprehensive overview of machine learning with accurate information and clear explanations.",
        strengths=[
            "Clear structure and organization",
            "Accurate technical information",
            "Good use of examples",
            "Consistent terminology"
        ],
        weaknesses=[
            "Could include more practical applications",
            "Some concepts could be explained in more detail"
        ],
        recommendations=[
            "Add more real-world examples",
            "Include practical implementation details",
            "Expand on advanced concepts"
        ],
        consistency_issues=[],
        missing_information=[
            "Recent developments in the field",
            "Comparison with other AI approaches"
        ]
    )


@pytest.fixture
def mock_fastapi_app():
    """Mock FastAPI application for testing."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    
    app = FastAPI()
    
    # Add test routes
    @app.get("/test")
    async def test_endpoint():
        return {"message": "test"}
    
    return TestClient(app)


# Pytest configuration
def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )


# Async test utilities
@pytest.fixture
def async_test():
    """Helper for async tests."""
    def _async_test(coro):
        return asyncio.get_event_loop().run_until_complete(coro)
    return _async_test
