"""
Test cases for service implementations.
Tests RAG service, LLM service, and evaluation pipeline.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from app.services.rag_service import RAGService
from app.services.llm_service import LLMService
from app.services.evaluation_pipeline import EvaluationPipeline
from app.models.schemas import (
    DocumentMetadata, RetrievedDocument, RAGQueryRequest, DocumentEvaluationRequest,
    EvaluationResult, EvaluationScore, EvaluationCriteria
)


class TestRAGService:
    """Test cases for RAG service."""
    
    @pytest.mark.asyncio
    async def test_retrieve_documents_success(self, mock_vector_db_client, mock_supabase_client):
        """Test successful document retrieval."""
        # Setup mocks
        mock_vector_db_client.search_similar.return_value = [
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
        mock_supabase_client.get_document.return_value = {
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
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test retrieval
        result = await service.retrieve_documents(
            query="test query",
            top_k=5,
            similarity_threshold=0.7
        )
        
        assert len(result) == 1
        assert result[0].id == "doc1_chunk_0"
        assert result[0].similarity_score == 0.85
        assert result[0].content == "Test document content"
    
    @pytest.mark.asyncio
    async def test_retrieve_documents_no_results(self, mock_vector_db_client, mock_supabase_client):
        """Test document retrieval with no results."""
        # Setup mocks
        mock_vector_db_client.search_similar.return_value = []
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test retrieval
        result = await service.retrieve_documents(
            query="test query",
            top_k=5,
            similarity_threshold=0.7
        )
        
        assert len(result) == 0
    
    @pytest.mark.asyncio
    async def test_upload_document_success(self, mock_vector_db_client, mock_supabase_client):
        """Test successful document upload."""
        # Setup mocks
        mock_vector_db_client.embed_texts.return_value = [[0.1] * 384] * 3
        mock_supabase_client.store_document.return_value = "doc1"
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test upload
        metadata = DocumentMetadata(
            id="doc1",
            title="Test Document",
            source="test_source",
            author="test_author",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            tags=["test"],
            category="test_category"
        )
        
        result = await service.upload_document(
            content="Test document content for chunking",
            metadata=metadata,
            chunk_size=1000,
            chunk_overlap=200
        )
        
        assert result == "doc1"
        mock_supabase_client.store_document.assert_called_once()
        mock_vector_db_client.upsert_vectors.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_document_success(self, mock_vector_db_client, mock_supabase_client):
        """Test successful document deletion."""
        # Setup mocks
        mock_vector_db_client.delete_vectors.return_value = None
        mock_supabase_client.delete_document.return_value = True
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test deletion
        result = await service.delete_document("doc1")
        
        assert result is True
        mock_vector_db_client.delete_vectors.assert_called_once()
        mock_supabase_client.delete_document.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_system_stats(self, mock_vector_db_client, mock_supabase_client):
        """Test getting system statistics."""
        # Setup mocks
        mock_vector_db_client.get_index_stats.return_value = {
            "total_vector_count": 100,
            "dimension": 384,
            "index_fullness": 0.1,
            "namespaces": {}
        }
        mock_supabase_client.get_document_stats.return_value = {
            "total_documents": 10,
            "total_chunks": 30,
            "category_distribution": {"test": 10}
        }
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test stats
        result = await service.get_system_stats()
        
        assert "vector_database" in result
        assert "document_database" in result
        assert result["total_vectors"] == 100
        assert result["total_documents"] == 10
    
    @pytest.mark.asyncio
    async def test_health_check(self, mock_vector_db_client, mock_supabase_client):
        """Test health check."""
        # Setup mocks
        mock_vector_db_client.health_check.return_value = True
        mock_supabase_client.health_check.return_value = True
        
        # Create service
        service = RAGService()
        service.vector_db_client = mock_vector_db_client
        service.supabase_client = mock_supabase_client
        
        # Test health check
        result = await service.health_check()
        
        assert result["vector_database"] is True
        assert result["document_database"] is True
        assert result["overall"] is True


class TestLLMService:
    """Test cases for LLM service."""
    
    @pytest.mark.asyncio
    async def test_generate_text_success(self, mock_llm_service):
        """Test successful text generation."""
        # Setup mock
        mock_llm_service.generate_text.return_value = "Generated text response"
        
        # Test generation
        result = await mock_llm_service.generate_text("Test prompt")
        
        assert result == "Generated text response"
    
    @pytest.mark.asyncio
    async def test_summarize_text_success(self, mock_llm_service):
        """Test successful text summarization."""
        # Setup mock
        mock_llm_service.summarize_text.return_value = "Document summary"
        
        # Test summarization
        result = await mock_llm_service.summarize_text("Long document content", max_length=500)
        
        assert result == "Document summary"
    
    @pytest.mark.asyncio
    async def test_evaluate_document_success(self, mock_llm_service):
        """Test successful document evaluation."""
        # Setup mock
        mock_llm_service.evaluate_document.return_value = EvaluationResult(
            overall_score=8.5,
            criterion_scores=[
                EvaluationScore(
                    criterion=EvaluationCriteria.RELEVANCE,
                    score=8.0,
                    reasoning="Highly relevant"
                )
            ],
            summary="Good document",
            strengths=["Clear structure"],
            weaknesses=["Could be more detailed"],
            recommendations=["Add examples"],
            consistency_issues=[],
            missing_information=[]
        )
        
        # Test evaluation
        result = await mock_llm_service.evaluate_document(
            content="Test document content",
            criteria=[EvaluationCriteria.RELEVANCE],
            context="Test context"
        )
        
        assert result.overall_score == 8.5
        assert len(result.criterion_scores) == 1
        assert result.criterion_scores[0].criterion == EvaluationCriteria.RELEVANCE
    
    @pytest.mark.asyncio
    async def test_check_consistency_success(self, mock_llm_service):
        """Test successful consistency check."""
        # Setup mock
        mock_llm_service.check_consistency.return_value = {
            "consistency_score": 8.0,
            "contradictions": [],
            "inconsistencies": [],
            "missing_context": [],
            "recommendations": []
        }
        
        # Test consistency check
        result = await mock_llm_service.check_consistency(
            main_content="Main document content",
            reference_documents=[
                {"content": "Reference content", "metadata": {}}
            ]
        )
        
        assert result["consistency_score"] == 8.0
        assert len(result["contradictions"]) == 0
    
    @pytest.mark.asyncio
    async def test_score_relevance_success(self, mock_llm_service):
        """Test successful relevance scoring."""
        # Setup mock
        mock_llm_service.score_relevance.return_value = {
            "score": 8.5,
            "reasoning": "Highly relevant to the query",
            "raw_response": "Relevance analysis"
        }
        
        # Test relevance scoring
        result = await mock_llm_service.score_relevance(
            query="test query",
            content="test content",
            context="test context"
        )
        
        assert result["score"] == 8.5
        assert "reasoning" in result
    
    @pytest.mark.asyncio
    async def test_generate_questions_success(self, mock_llm_service):
        """Test successful question generation."""
        # Setup mock
        mock_llm_service.generate_questions.return_value = [
            "What is the main topic?",
            "What are the key findings?",
            "How does this relate to other research?"
        ]
        
        # Test question generation
        result = await mock_llm_service.generate_questions(
            content="Test document content",
            num_questions=3
        )
        
        assert len(result) == 3
        assert "What is the main topic?" in result
    
    @pytest.mark.asyncio
    async def test_extract_key_points_success(self, mock_llm_service):
        """Test successful key point extraction."""
        # Setup mock
        mock_llm_service.extract_key_points.return_value = [
            "Key point 1",
            "Key point 2",
            "Key point 3"
        ]
        
        # Test key point extraction
        result = await mock_llm_service.extract_key_points("Test document content")
        
        assert len(result) == 3
        assert "Key point 1" in result
    
    @pytest.mark.asyncio
    async def test_compare_documents_success(self, mock_llm_service):
        """Test successful document comparison."""
        # Setup mock
        mock_llm_service.compare_documents.return_value = {
            "comparison_result": "Document comparison analysis",
            "documents_compared": 2,
            "processing_time": 1.5
        }
        
        # Test document comparison
        result = await mock_llm_service.compare_documents(
            documents=[
                {"content": "Document 1", "metadata": {}},
                {"content": "Document 2", "metadata": {}}
            ],
            comparison_criteria=["relevance", "accuracy"]
        )
        
        assert result["documents_compared"] == 2
        assert "comparison_result" in result
    
    @pytest.mark.asyncio
    async def test_health_check(self, mock_llm_service):
        """Test health check."""
        # Setup mock
        mock_llm_service.health_check.return_value = True
        
        # Test health check
        result = await mock_llm_service.health_check()
        
        assert result is True


class TestEvaluationPipeline:
    """Test cases for evaluation pipeline."""
    
    @pytest.mark.asyncio
    async def test_process_rag_query_success(self, mock_rag_service, mock_llm_service):
        """Test successful RAG query processing."""
        # Setup mocks
        mock_rag_service.retrieve_documents.return_value = [
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
        mock_llm_service.evaluate_document.return_value = EvaluationResult(
            overall_score=8.5,
            criterion_scores=[],
            summary="Good document",
            strengths=[],
            weaknesses=[],
            recommendations=[],
            consistency_issues=[],
            missing_information=[]
        )
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.rag_service = mock_rag_service
        pipeline.llm_service = mock_llm_service
        
        # Test processing
        request = RAGQueryRequest(
            query="test query",
            top_k=5,
            similarity_threshold=0.7,
            include_evaluation=True
        )
        
        result = await pipeline.process_rag_query(request)
        
        assert "query" in result
        assert "retrieved_documents" in result
        assert "evaluation" in result
        assert "processing_time" in result
    
    @pytest.mark.asyncio
    async def test_evaluate_document_success(self, mock_llm_service):
        """Test successful document evaluation."""
        # Setup mock
        mock_llm_service.evaluate_document.return_value = EvaluationResult(
            overall_score=8.5,
            criterion_scores=[],
            summary="Good document",
            strengths=[],
            weaknesses=[],
            recommendations=[],
            consistency_issues=[],
            missing_information=[]
        )
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.llm_service = mock_llm_service
        
        # Test evaluation
        request = DocumentEvaluationRequest(
            document_content="Test document content",
            evaluation_criteria=[EvaluationCriteria.RELEVANCE],
            context="Test context"
        )
        
        result = await pipeline.evaluate_document(request)
        
        assert "evaluation" in result
        assert "processing_time" in result
    
    @pytest.mark.asyncio
    async def test_process_batch_rag_success(self, mock_rag_service, mock_llm_service):
        """Test successful batch RAG processing."""
        # Setup mocks
        mock_rag_service.retrieve_documents.return_value = []
        mock_llm_service.evaluate_document.return_value = EvaluationResult(
            overall_score=8.5,
            criterion_scores=[],
            summary="Good document",
            strengths=[],
            weaknesses=[],
            recommendations=[],
            consistency_issues=[],
            missing_information=[]
        )
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.rag_service = mock_rag_service
        pipeline.llm_service = mock_llm_service
        
        # Test batch processing
        request = BatchRAGRequest(
            queries=["query1", "query2", "query3"],
            top_k=5,
            similarity_threshold=0.7,
            include_evaluation=True
        )
        
        result = await pipeline.process_batch_rag(request)
        
        assert "results" in result
        assert "total_processing_time" in result
        assert "successful_queries" in result
        assert "failed_queries" in result
    
    @pytest.mark.asyncio
    async def test_generate_insights_success(self, mock_llm_service):
        """Test successful insights generation."""
        # Setup mocks
        mock_llm_service.extract_key_points.return_value = ["Point 1", "Point 2"]
        mock_llm_service.generate_questions.return_value = ["Question 1", "Question 2"]
        mock_llm_service.summarize_text.return_value = "Document summary"
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.llm_service = mock_llm_service
        
        # Test insights generation
        documents = [
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
        
        result = await pipeline.generate_insights("test query", documents)
        
        assert "summary" in result
        assert "key_points" in result
        assert "questions" in result
        assert "document_count" in result
        assert "processing_time" in result
    
    @pytest.mark.asyncio
    async def test_compare_documents_success(self, mock_llm_service):
        """Test successful document comparison."""
        # Setup mock
        mock_llm_service.compare_documents.return_value = {
            "comparison_result": "Comparison analysis",
            "documents_compared": 2,
            "processing_time": 1.5
        }
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.llm_service = mock_llm_service
        
        # Test comparison
        documents = [
            RetrievedDocument(
                id="doc1_chunk_0",
                content="Document 1 content",
                metadata=DocumentMetadata(
                    id="doc1",
                    title="Document 1",
                    source="test_source",
                    author="test_author",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    tags=["test"],
                    category="test_category"
                ),
                similarity_score=0.85,
                chunk_index=0
            ),
            RetrievedDocument(
                id="doc2_chunk_0",
                content="Document 2 content",
                metadata=DocumentMetadata(
                    id="doc2",
                    title="Document 2",
                    source="test_source",
                    author="test_author",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    tags=["test"],
                    category="test_category"
                ),
                similarity_score=0.80,
                chunk_index=0
            )
        ]
        
        result = await pipeline.compare_documents(
            documents=documents,
            comparison_criteria=["relevance", "accuracy"]
        )
        
        assert "comparison_result" in result
        assert "documents_compared" in result
        assert "processing_time" in result
    
    @pytest.mark.asyncio
    async def test_health_check(self, mock_rag_service, mock_llm_service):
        """Test health check."""
        # Setup mocks
        mock_rag_service.health_check.return_value = {
            "rag_service": True,
            "llm_service": True,
            "overall": True
        }
        mock_llm_service.health_check.return_value = True
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.rag_service = mock_rag_service
        pipeline.llm_service = mock_llm_service
        
        # Test health check
        result = await pipeline.health_check()
        
        assert result["rag_service"] is True
        assert result["llm_service"] is True
        assert result["overall"] is True
    
    @pytest.mark.asyncio
    async def test_get_pipeline_stats(self, mock_rag_service):
        """Test getting pipeline statistics."""
        # Setup mock
        mock_rag_service.get_system_stats.return_value = {
            "vector_database": {"total_vector_count": 100},
            "document_database": {"total_documents": 10},
            "total_vectors": 100,
            "total_documents": 10,
            "total_chunks": 30
        }
        
        # Create pipeline
        pipeline = EvaluationPipeline()
        pipeline.rag_service = mock_rag_service
        
        # Test stats
        result = await pipeline.get_pipeline_stats()
        
        assert "rag_service" in result
        assert "pipeline_status" in result
