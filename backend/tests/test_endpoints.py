"""
Test cases for FastAPI endpoints.
Tests all API endpoints with mocked dependencies.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from datetime import datetime

from app.main import app
from app.models.schemas import (
    RAGQueryRequest, DocumentEvaluationRequest, BatchRAGRequest,
    DocumentMetadata, EvaluationCriteria
)


@pytest.fixture
def client():
    """Test client for FastAPI app."""
    return TestClient(app)


class TestRAGEndpoints:
    """Test cases for RAG endpoints."""
    
    def test_rag_query_success(self, client):
        """Test successful RAG query."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_rag_query.return_value = {
                "query": "test query",
                "retrieved_documents": [],
                "evaluation": None,
                "processing_time": 1.0,
                "total_documents_found": 0
            }
            mock_dep.return_value = mock_pipeline
            
            # Test request
            request_data = {
                "query": "What is machine learning?",
                "top_k": 5,
                "similarity_threshold": 0.7,
                "include_evaluation": True,
                "evaluation_criteria": ["relevance", "accuracy"]
            }
            
            response = client.post("/api/v1/rag/query", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "query" in data
            assert "retrieved_documents" in data
            assert "processing_time" in data
    
    def test_rag_query_invalid_query(self, client):
        """Test RAG query with invalid query."""
        request_data = {
            "query": "",  # Empty query
            "top_k": 5,
            "similarity_threshold": 0.7,
            "include_evaluation": True
        }
        
        response = client.post("/api/v1/rag/query", json=request_data)
        assert response.status_code == 400
    
    def test_rag_query_too_long(self, client):
        """Test RAG query with query too long."""
        request_data = {
            "query": "x" * 1001,  # Query too long
            "top_k": 5,
            "similarity_threshold": 0.7,
            "include_evaluation": True
        }
        
        response = client.post("/api/v1/rag/query", json=request_data)
        assert response.status_code == 400
    
    def test_document_evaluation_success(self, client):
        """Test successful document evaluation."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.evaluate_document.return_value = {
                "evaluation": {
                    "overall_score": 8.5,
                    "criterion_scores": [],
                    "summary": "Good document",
                    "strengths": [],
                    "weaknesses": [],
                    "recommendations": [],
                    "consistency_issues": [],
                    "missing_information": []
                },
                "processing_time": 1.0
            }
            mock_dep.return_value = mock_pipeline
            
            # Test request
            request_data = {
                "document_content": "This is a test document about machine learning.",
                "document_metadata": {
                    "id": "test_doc_1",
                    "title": "Test Document",
                    "source": "test_source",
                    "author": "test_author",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "tags": ["test"],
                    "category": "technology"
                },
                "evaluation_criteria": ["relevance", "accuracy"],
                "context": "Testing evaluation"
            }
            
            response = client.post("/api/v1/rag/evaluate", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "evaluation" in data
            assert "processing_time" in data
    
    def test_document_evaluation_content_too_large(self, client):
        """Test document evaluation with content too large."""
        request_data = {
            "document_content": "x" * 10001,  # Content too large
            "evaluation_criteria": ["relevance"]
        }
        
        response = client.post("/api/v1/rag/evaluate", json=request_data)
        assert response.status_code == 413
    
    def test_batch_rag_success(self, client):
        """Test successful batch RAG processing."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_batch_rag.return_value = {
                "results": [],
                "total_processing_time": 5.0,
                "successful_queries": 3,
                "failed_queries": 0
            }
            mock_dep.return_value = mock_pipeline
            
            # Test request
            request_data = {
                "queries": [
                    "What is machine learning?",
                    "How does deep learning work?",
                    "What are neural networks?"
                ],
                "top_k": 3,
                "similarity_threshold": 0.7,
                "include_evaluation": True
            }
            
            response = client.post("/api/v1/rag/batch", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert "total_processing_time" in data
            assert "successful_queries" in data
            assert "failed_queries" in data
    
    def test_advanced_rag_success(self, client):
        """Test successful advanced RAG processing."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_advanced_rag.return_value = {
                "query": "test query",
                "retrieved_documents": [],
                "evaluation": None,
                "processing_time": 2.0,
                "total_documents_found": 0
            }
            mock_dep.return_value = mock_pipeline
            
            # Test request
            request_data = {
                "query": "What is machine learning?",
                "filters": {
                    "sources": ["academic_papers"],
                    "categories": ["technology"]
                },
                "top_k": 5,
                "similarity_threshold": 0.7,
                "include_evaluation": True,
                "rerank": True
            }
            
            response = client.post("/api/v1/rag/advanced", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "query" in data
            assert "retrieved_documents" in data
            assert "processing_time" in data


class TestDocumentEndpoints:
    """Test cases for document management endpoints."""
    
    def test_upload_document_success(self, client):
        """Test successful document upload."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.upload_document.return_value = "doc1"
            mock_dep.return_value = mock_service
            
            # Test request
            request_data = {
                "content": "This is a test document about machine learning algorithms.",
                "metadata": {
                    "id": "test_doc_1",
                    "title": "Test Document",
                    "source": "test_source",
                    "author": "test_author",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "tags": ["test", "ml"],
                    "category": "technology"
                },
                "chunk_size": 1000,
                "chunk_overlap": 200
            }
            
            response = client.post("/api/v1/documents/upload", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "document_id" in data
            assert "chunks_created" in data
            assert "status" in data
    
    def test_upload_document_content_too_large(self, client):
        """Test document upload with content too large."""
        request_data = {
            "content": "x" * 10001,  # Content too large
            "metadata": {
                "id": "test_doc_1",
                "title": "Test Document"
            }
        }
        
        response = client.post("/api/v1/documents/upload", json=request_data)
        assert response.status_code == 413
    
    def test_delete_document_success(self, client):
        """Test successful document deletion."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.delete_document.return_value = True
            mock_dep.return_value = mock_service
            
            response = client.delete("/api/v1/documents/doc1")
            
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
    
    def test_delete_document_not_found(self, client):
        """Test document deletion when document not found."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.delete_document.return_value = False
            mock_dep.return_value = mock_service
            
            response = client.delete("/api/v1/documents/nonexistent")
            
            assert response.status_code == 404
    
    def test_get_document_success(self, client):
        """Test successful document retrieval."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.get_document_by_id.return_value = {
                "id": "doc1",
                "title": "Test Document",
                "content": "Test content",
                "source": "test_source"
            }
            mock_dep.return_value = mock_service
            
            response = client.get("/api/v1/documents/doc1")
            
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "title" in data
    
    def test_get_document_not_found(self, client):
        """Test document retrieval when document not found."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.get_document_by_id.return_value = None
            mock_dep.return_value = mock_service
            
            response = client.get("/api/v1/documents/nonexistent")
            
            assert response.status_code == 404
    
    def test_reindex_document_success(self, client):
        """Test successful document reindexing."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.reindex_document.return_value = True
            mock_dep.return_value = mock_service
            
            response = client.post("/api/v1/documents/doc1/reindex")
            
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
    
    def test_reindex_document_not_found(self, client):
        """Test document reindexing when document not found."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.reindex_document.return_value = False
            mock_dep.return_value = mock_service
            
            response = client.post("/api/v1/documents/nonexistent/reindex")
            
            assert response.status_code == 404


class TestSystemEndpoints:
    """Test cases for system endpoints."""
    
    def test_health_check_success(self, client):
        """Test successful health check."""
        with patch('app.api.dependencies.get_service_manager') as mock_dep:
            # Mock the service manager
            mock_manager = AsyncMock()
            mock_manager.check_health.return_value = {
                "rag_service": True,
                "llm_service": True,
                "vector_database": True,
                "document_database": True,
                "overall": True
            }
            mock_dep.return_value = mock_manager
            
            response = client.get("/api/v1/health")
            
            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert "timestamp" in data
            assert "version" in data
            assert "services" in data
    
    def test_health_check_unhealthy(self, client):
        """Test health check when services are unhealthy."""
        with patch('app.api.dependencies.get_service_manager') as mock_dep:
            # Mock the service manager
            mock_manager = AsyncMock()
            mock_manager.check_health.return_value = {
                "rag_service": False,
                "llm_service": False,
                "vector_database": False,
                "document_database": False,
                "overall": False
            }
            mock_dep.return_value = mock_manager
            
            response = client.get("/api/v1/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
    
    def test_metrics_success(self, client):
        """Test successful metrics retrieval."""
        with patch('app.api.dependencies.get_service_manager') as mock_dep:
            # Mock the service manager
            mock_manager = AsyncMock()
            mock_manager.get_service_stats.return_value = {
                "rag_service": {
                    "vector_database": {"total_vector_count": 100},
                    "document_database": {"total_documents": 10}
                }
            }
            mock_dep.return_value = mock_manager
            
            response = client.get("/api/v1/metrics")
            
            assert response.status_code == 200
            data = response.json()
            assert "total_queries" in data
            assert "average_processing_time" in data
            assert "documents_indexed" in data
            assert "evaluation_stats" in data
            assert "uptime" in data
    
    def test_insights_success(self, client):
        """Test successful insights generation."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.generate_insights.return_value = {
                "summary": "Document summary",
                "key_points": ["Point 1", "Point 2"],
                "questions": ["Question 1", "Question 2"],
                "document_count": 1,
                "processing_time": 1.0
            }
            mock_dep.return_value = mock_pipeline
            
            response = client.get("/api/v1/insights/test%20query")
            
            assert response.status_code == 200
            data = response.json()
            assert "summary" in data
            assert "key_points" in data
            assert "questions" in data
    
    def test_compare_documents_success(self, client):
        """Test successful document comparison."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep, \
             patch('app.api.dependencies.get_rag_service_dependency') as mock_rag_dep:
            
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.compare_documents.return_value = {
                "comparison_result": "Comparison analysis",
                "documents_compared": 2,
                "processing_time": 1.5
            }
            mock_dep.return_value = mock_pipeline
            
            # Mock the RAG service
            mock_rag_service = AsyncMock()
            mock_rag_service.get_document_by_id.return_value = {
                "id": "doc1",
                "title": "Test Document",
                "content": "Test content"
            }
            mock_rag_dep.return_value = mock_rag_service
            
            response = client.post(
                "/api/v1/compare",
                json={
                    "document_ids": ["doc1", "doc2"],
                    "comparison_criteria": ["relevance", "accuracy"]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "comparison_result" in data
            assert "documents_compared" in data
    
    def test_compare_documents_not_found(self, client):
        """Test document comparison when documents not found."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.get_document_by_id.return_value = None
            mock_dep.return_value = mock_service
            
            response = client.post(
                "/api/v1/compare",
                json={
                    "document_ids": ["nonexistent"],
                    "comparison_criteria": ["relevance"]
                }
            )
            
            assert response.status_code == 404


class TestRootEndpoints:
    """Test cases for root endpoints."""
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
    
    def test_api_root_endpoint(self, client):
        """Test API root endpoint."""
        response = client.get("/api/v1/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
    
    def test_health_endpoint(self, client):
        """Test simple health endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "service" in data
