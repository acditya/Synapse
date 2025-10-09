"""
Integration tests for the RAG evaluation API.
Tests end-to-end functionality with real service interactions.
"""

import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app
from app.models.schemas import (
    DocumentMetadata, RAGQueryRequest, DocumentEvaluationRequest,
    EvaluationCriteria
)


@pytest.fixture
def client():
    """Test client for integration tests."""
    return TestClient(app)


class TestRAGIntegration:
    """Integration tests for RAG functionality."""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_full_rag_pipeline(self, client):
        """Test complete RAG pipeline from query to evaluation."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the complete pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_rag_query.return_value = {
                "query": "What is machine learning?",
                "retrieved_documents": [
                    {
                        "id": "doc1_chunk_0",
                        "content": "Machine learning is a subset of artificial intelligence.",
                        "metadata": {
                            "id": "doc1",
                            "title": "ML Introduction",
                            "source": "academic_paper",
                            "author": "AI Researcher",
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat(),
                            "tags": ["ml", "ai"],
                            "category": "technology"
                        },
                        "similarity_score": 0.92,
                        "chunk_index": 0
                    }
                ],
                "evaluation": {
                    "overall_score": 8.5,
                    "criterion_scores": [
                        {
                            "criterion": "relevance",
                            "score": 9.0,
                            "reasoning": "Highly relevant to machine learning topic"
                        }
                    ],
                    "summary": "Excellent document on machine learning",
                    "strengths": ["Clear explanations", "Accurate information"],
                    "weaknesses": ["Could include more examples"],
                    "recommendations": ["Add practical examples"],
                    "consistency_issues": [],
                    "missing_information": []
                },
                "processing_time": 2.5,
                "total_documents_found": 1
            }
            mock_dep.return_value = mock_pipeline
            
            # Test complete pipeline
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
            
            # Verify response structure
            assert "query" in data
            assert "retrieved_documents" in data
            assert "evaluation" in data
            assert "processing_time" in data
            assert "total_documents_found" in data
            
            # Verify evaluation structure
            evaluation = data["evaluation"]
            assert "overall_score" in evaluation
            assert "criterion_scores" in evaluation
            assert "summary" in evaluation
            assert "strengths" in evaluation
            assert "weaknesses" in evaluation
            assert "recommendations" in evaluation
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_document_upload_and_retrieval(self, client):
        """Test document upload and subsequent retrieval."""
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            # Mock the RAG service
            mock_service = AsyncMock()
            mock_service.upload_document.return_value = "test_doc_123"
            mock_dep.return_value = mock_service
            
            # Test document upload
            upload_data = {
                "content": "This is a comprehensive document about machine learning algorithms, including supervised learning, unsupervised learning, and reinforcement learning techniques.",
                "metadata": {
                    "id": "test_doc_123",
                    "title": "Machine Learning Algorithms",
                    "source": "academic_textbook",
                    "author": "ML Expert",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "tags": ["ml", "algorithms", "supervised", "unsupervised"],
                    "category": "technology"
                },
                "chunk_size": 1000,
                "chunk_overlap": 200
            }
            
            upload_response = client.post("/api/v1/documents/upload", json=upload_data)
            
            assert upload_response.status_code == 200
            upload_result = upload_response.json()
            assert upload_result["document_id"] == "test_doc_123"
            assert upload_result["status"] == "success"
            
            # Test document retrieval
            mock_service.get_document_by_id.return_value = {
                "id": "test_doc_123",
                "title": "Machine Learning Algorithms",
                "source": "academic_textbook",
                "author": "ML Expert",
                "content": "This is a comprehensive document about machine learning algorithms...",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "tags": ["ml", "algorithms", "supervised", "unsupervised"],
                "category": "technology"
            }
            
            get_response = client.get("/api/v1/documents/test_doc_123")
            
            assert get_response.status_code == 200
            get_result = get_response.json()
            assert get_result["id"] == "test_doc_123"
            assert get_result["title"] == "Machine Learning Algorithms"
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_batch_processing(self, client):
        """Test batch RAG processing with multiple queries."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_batch_rag.return_value = {
                "results": [
                    {
                        "query": "What is supervised learning?",
                        "retrieved_documents": [],
                        "evaluation": None,
                        "processing_time": 1.0,
                        "total_documents_found": 0
                    },
                    {
                        "query": "What is unsupervised learning?",
                        "retrieved_documents": [],
                        "evaluation": None,
                        "processing_time": 1.2,
                        "total_documents_found": 0
                    },
                    {
                        "query": "What is reinforcement learning?",
                        "retrieved_documents": [],
                        "evaluation": None,
                        "processing_time": 1.1,
                        "total_documents_found": 0
                    }
                ],
                "total_processing_time": 3.3,
                "successful_queries": 3,
                "failed_queries": 0
            }
            mock_dep.return_value = mock_pipeline
            
            # Test batch processing
            batch_data = {
                "queries": [
                    "What is supervised learning?",
                    "What is unsupervised learning?",
                    "What is reinforcement learning?"
                ],
                "top_k": 3,
                "similarity_threshold": 0.7,
                "include_evaluation": False
            }
            
            response = client.post("/api/v1/rag/batch", json=batch_data)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify batch response structure
            assert "results" in data
            assert "total_processing_time" in data
            assert "successful_queries" in data
            assert "failed_queries" in data
            
            # Verify individual results
            assert len(data["results"]) == 3
            for result in data["results"]:
                assert "query" in result
                assert "retrieved_documents" in result
                assert "processing_time" in result
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_advanced_rag_with_filters(self, client):
        """Test advanced RAG with filters and reranking."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.process_advanced_rag.return_value = {
                "query": "What are neural networks?",
                "retrieved_documents": [
                    {
                        "id": "doc1_chunk_0",
                        "content": "Neural networks are computing systems inspired by biological neural networks.",
                        "metadata": {
                            "id": "doc1",
                            "title": "Neural Networks Guide",
                            "source": "academic_paper",
                            "author": "AI Researcher",
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat(),
                            "tags": ["neural_networks", "deep_learning"],
                            "category": "technology"
                        },
                        "similarity_score": 0.95,
                        "chunk_index": 0
                    }
                ],
                "evaluation": None,
                "processing_time": 2.8,
                "total_documents_found": 1
            }
            mock_dep.return_value = mock_pipeline
            
            # Test advanced RAG
            advanced_data = {
                "query": "What are neural networks?",
                "filters": {
                    "sources": ["academic_paper", "research_journal"],
                    "categories": ["technology", "ai"],
                    "tags": ["neural_networks", "deep_learning"]
                },
                "top_k": 5,
                "similarity_threshold": 0.8,
                "include_evaluation": False,
                "rerank": True
            }
            
            response = client.post("/api/v1/rag/advanced", json=advanced_data)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify advanced RAG response
            assert "query" in data
            assert "retrieved_documents" in data
            assert "processing_time" in data
            assert "total_documents_found" in data
            
            # Verify document structure
            if data["retrieved_documents"]:
                doc = data["retrieved_documents"][0]
                assert "id" in doc
                assert "content" in doc
                assert "metadata" in doc
                assert "similarity_score" in doc


class TestEvaluationIntegration:
    """Integration tests for evaluation functionality."""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_document_evaluation_pipeline(self, client):
        """Test complete document evaluation pipeline."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.evaluate_document.return_value = {
                "evaluation": {
                    "overall_score": 8.5,
                    "criterion_scores": [
                        {
                            "criterion": "relevance",
                            "score": 9.0,
                            "reasoning": "Highly relevant to the topic"
                        },
                        {
                            "criterion": "accuracy",
                            "score": 8.0,
                            "reasoning": "Accurate information with good examples"
                        },
                        {
                            "criterion": "completeness",
                            "score": 8.5,
                            "reasoning": "Covers main concepts comprehensively"
                        },
                        {
                            "criterion": "consistency",
                            "score": 9.0,
                            "reasoning": "Consistent throughout the document"
                        },
                        {
                            "criterion": "clarity",
                            "score": 8.0,
                            "reasoning": "Clear and well-structured"
                        }
                    ],
                    "summary": "This document provides a comprehensive overview of machine learning with accurate information and clear explanations.",
                    "strengths": [
                        "Clear structure and organization",
                        "Accurate technical information",
                        "Good use of examples",
                        "Consistent terminology"
                    ],
                    "weaknesses": [
                        "Could include more practical applications",
                        "Some concepts could be explained in more detail"
                    ],
                    "recommendations": [
                        "Add more real-world examples",
                        "Include practical implementation details",
                        "Expand on advanced concepts"
                    ],
                    "consistency_issues": [],
                    "missing_information": [
                        "Recent developments in the field",
                        "Comparison with other AI approaches"
                    ]
                },
                "processing_time": 3.2
            }
            mock_dep.return_value = mock_pipeline
            
            # Test document evaluation
            evaluation_data = {
                "document_content": "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. It enables computers to learn and improve from experience without being explicitly programmed. The field includes supervised learning, unsupervised learning, and reinforcement learning approaches.",
                "document_metadata": {
                    "id": "ml_doc_001",
                    "title": "Introduction to Machine Learning",
                    "source": "academic_textbook",
                    "author": "AI Professor",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "tags": ["machine_learning", "artificial_intelligence", "algorithms"],
                    "category": "technology"
                },
                "evaluation_criteria": ["relevance", "accuracy", "completeness", "consistency", "clarity"],
                "context": "Evaluating a machine learning introduction document for educational purposes"
            }
            
            response = client.post("/api/v1/rag/evaluate", json=evaluation_data)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify evaluation response structure
            assert "evaluation" in data
            assert "processing_time" in data
            
            evaluation = data["evaluation"]
            assert "overall_score" in evaluation
            assert "criterion_scores" in evaluation
            assert "summary" in evaluation
            assert "strengths" in evaluation
            assert "weaknesses" in evaluation
            assert "recommendations" in evaluation
            assert "consistency_issues" in evaluation
            assert "missing_information" in evaluation
            
            # Verify criterion scores
            assert len(evaluation["criterion_scores"]) == 5
            for score in evaluation["criterion_scores"]:
                assert "criterion" in score
                assert "score" in score
                assert "reasoning" in score
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_insights_generation(self, client):
        """Test insights generation from documents."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep:
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.generate_insights.return_value = {
                "summary": "This collection of documents provides comprehensive coverage of machine learning topics, including supervised learning, unsupervised learning, and neural networks.",
                "key_points": [
                    "Machine learning is a subset of artificial intelligence",
                    "Three main types: supervised, unsupervised, and reinforcement learning",
                    "Neural networks are inspired by biological neural networks",
                    "Deep learning uses multi-layer neural networks"
                ],
                "questions": [
                    "What are the main types of machine learning?",
                    "How do neural networks work?",
                    "What is the difference between supervised and unsupervised learning?",
                    "What are the applications of deep learning?",
                    "How does reinforcement learning differ from other approaches?"
                ],
                "document_count": 3,
                "processing_time": 4.5
            }
            mock_dep.return_value = mock_pipeline
            
            # Test insights generation
            response = client.get("/api/v1/insights/machine%20learning%20algorithms")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify insights structure
            assert "summary" in data
            assert "key_points" in data
            assert "questions" in data
            assert "document_count" in data
            assert "processing_time" in data
            
            # Verify content quality
            assert len(data["key_points"]) > 0
            assert len(data["questions"]) > 0
            assert data["document_count"] > 0
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_document_comparison(self, client):
        """Test document comparison functionality."""
        with patch('app.api.dependencies.get_evaluation_pipeline_dependency') as mock_dep, \
             patch('app.api.dependencies.get_rag_service_dependency') as mock_rag_dep:
            
            # Mock the evaluation pipeline
            mock_pipeline = AsyncMock()
            mock_pipeline.compare_documents.return_value = {
                "comparison_result": "Document 1 focuses on theoretical foundations while Document 2 emphasizes practical applications. Both are well-structured but Document 2 provides more real-world examples.",
                "documents_compared": 2,
                "processing_time": 3.8
            }
            mock_dep.return_value = mock_pipeline
            
            # Mock the RAG service
            mock_rag_service = AsyncMock()
            mock_rag_service.get_document_by_id.return_value = {
                "id": "doc1",
                "title": "Machine Learning Theory",
                "content": "Theoretical foundations of machine learning...",
                "source": "academic_paper"
            }
            mock_rag_dep.return_value = mock_rag_service
            
            # Test document comparison
            comparison_data = {
                "document_ids": ["doc1", "doc2"],
                "comparison_criteria": ["relevance", "accuracy", "completeness", "clarity"]
            }
            
            response = client.post("/api/v1/compare", json=comparison_data)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify comparison response
            assert "comparison_result" in data
            assert "documents_compared" in data
            assert "processing_time" in data
            
            # Verify comparison content
            assert data["documents_compared"] == 2
            assert len(data["comparison_result"]) > 0


class TestSystemIntegration:
    """Integration tests for system functionality."""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_health_check_integration(self, client):
        """Test system health check integration."""
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
            
            # Test health check
            response = client.get("/api/v1/health")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify health check structure
            assert "status" in data
            assert "timestamp" in data
            assert "version" in data
            assert "services" in data
            
            # Verify service status
            assert data["status"] == "healthy"
            assert data["services"]["rag_service"] == "healthy"
            assert data["services"]["llm_service"] == "healthy"
            assert data["services"]["vector_database"] == "healthy"
            assert data["services"]["document_database"] == "healthy"
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_metrics_integration(self, client):
        """Test system metrics integration."""
        with patch('app.api.dependencies.get_service_manager') as mock_dep:
            # Mock the service manager
            mock_manager = AsyncMock()
            mock_manager.get_service_stats.return_value = {
                "rag_service": {
                    "vector_database": {"total_vector_count": 1500},
                    "document_database": {"total_documents": 25},
                    "total_vectors": 1500,
                    "total_documents": 25,
                    "total_chunks": 75
                }
            }
            mock_dep.return_value = mock_manager
            
            # Test metrics
            response = client.get("/api/v1/metrics")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify metrics structure
            assert "total_queries" in data
            assert "average_processing_time" in data
            assert "documents_indexed" in data
            assert "evaluation_stats" in data
            assert "uptime" in data
            
            # Verify metrics values
            assert data["documents_indexed"] == 25
            assert "total_evaluations" in data["evaluation_stats"]
            assert "average_score" in data["evaluation_stats"]
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_error_handling_integration(self, client):
        """Test error handling integration."""
        # Test invalid query
        invalid_query_data = {
            "query": "",  # Empty query
            "top_k": 5,
            "similarity_threshold": 0.7,
            "include_evaluation": True
        }
        
        response = client.post("/api/v1/rag/query", json=invalid_query_data)
        assert response.status_code == 400
        
        # Test content too large
        large_content_data = {
            "document_content": "x" * 10001,  # Content too large
            "evaluation_criteria": ["relevance"]
        }
        
        response = client.post("/api/v1/rag/evaluate", json=large_content_data)
        assert response.status_code == 413
        
        # Test document not found
        with patch('app.api.dependencies.get_rag_service_dependency') as mock_dep:
            mock_service = AsyncMock()
            mock_service.get_document_by_id.return_value = None
            mock_dep.return_value = mock_service
            
            response = client.get("/api/v1/documents/nonexistent")
            assert response.status_code == 404
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_root_endpoints_integration(self, client):
        """Test root endpoints integration."""
        # Test main root endpoint
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
        
        # Test API root endpoint
        response = client.get("/api/v1/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
        
        # Test simple health endpoint
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "service" in data
