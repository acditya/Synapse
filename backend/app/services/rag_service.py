"""
RAG (Retrieval-Augmented Generation) service implementation.
Handles document retrieval, embedding generation, and vector search operations.
"""

import asyncio
import time
from typing import List, Dict, Any, Optional, Tuple
from loguru import logger

from ..utils.vector_db import get_vector_db_client
from ..utils.supabase_client import get_supabase_client
from ..utils.langchain_utils import get_rag_pipeline
from ..models.schemas import RetrievedDocument, DocumentMetadata, SearchFilters


class RAGService:
    """Service for RAG operations including retrieval and document management."""
    
    def __init__(self):
        """Initialize the RAG service."""
        self.vector_db_client = None
        self.supabase_client = None
        self.rag_pipeline = None
        self._initialize_clients()
    
    def _initialize_clients(self) -> None:
        """Initialize required clients."""
        try:
            self.vector_db_client = get_vector_db_client()
            self.supabase_client = get_supabase_client()
            self.rag_pipeline = get_rag_pipeline()
            logger.info("RAG service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            raise
    
    async def retrieve_documents(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.7,
        filters: Optional[SearchFilters] = None
    ) -> List[RetrievedDocument]:
        """Retrieve relevant documents for a query."""
        try:
            start_time = time.time()
            
            # Generate query embedding
            query_embedding = await self.vector_db_client.embed_text(query)
            
            # Prepare filters for vector search
            filter_dict = None
            if filters:
                filter_dict = self._prepare_vector_filters(filters)
            
            # Search for similar vectors
            search_results = await self.vector_db_client.search_similar(
                query_embedding=query_embedding,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                filter_dict=filter_dict
            )
            
            # Convert to RetrievedDocument objects
            retrieved_docs = []
            for result in search_results:
                # Get full document from Supabase
                document_data = await self.supabase_client.get_document(result["id"])
                
                if document_data:
                    metadata = DocumentMetadata(
                        id=document_data["id"],
                        title=document_data.get("title"),
                        source=document_data.get("source"),
                        author=document_data.get("author"),
                        created_at=document_data.get("created_at"),
                        updated_at=document_data.get("updated_at"),
                        tags=document_data.get("tags", []),
                        category=document_data.get("category")
                    )
                    
                    doc = RetrievedDocument(
                        id=result["id"],
                        content=result["metadata"].get("content", ""),
                        metadata=metadata,
                        similarity_score=result["score"],
                        chunk_index=result["metadata"].get("chunk_index")
                    )
                    retrieved_docs.append(doc)
            
            processing_time = time.time() - start_time
            logger.info(f"Retrieved {len(retrieved_docs)} documents in {processing_time:.2f}s")
            
            return retrieved_docs
            
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {e}")
            raise
    
    def _prepare_vector_filters(self, filters: SearchFilters) -> Dict[str, Any]:
        """Prepare filters for vector search."""
        filter_dict = {}
        
        if filters.sources:
            filter_dict["source"] = {"$in": filters.sources}
        if filters.authors:
            filter_dict["author"] = {"$in": filters.authors}
        if filters.categories:
            filter_dict["category"] = {"$in": filters.categories}
        if filters.tags:
            filter_dict["tags"] = {"$in": filters.tags}
        if filters.date_from:
            filter_dict["created_at"] = {"$gte": filters.date_from.isoformat()}
        if filters.date_to:
            if "created_at" in filter_dict:
                filter_dict["created_at"]["$lte"] = filters.date_to.isoformat()
            else:
                filter_dict["created_at"] = {"$lte": filters.date_to.isoformat()}
        
        return filter_dict
    
    async def upload_document(
        self, 
        content: str, 
        metadata: DocumentMetadata,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> str:
        """Upload and index a new document."""
        try:
            start_time = time.time()
            
            # Split document into chunks
            text_splitter = self.rag_pipeline.create_text_splitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            chunks = text_splitter.split_text(content)
            
            # Generate embeddings for chunks
            chunk_embeddings = await self.vector_db_client.embed_texts(chunks)
            
            # Prepare vectors for upsert
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
                vector_id = f"{metadata.id}_chunk_{i}"
                chunk_metadata = {
                    "content": chunk,
                    "document_id": metadata.id,
                    "chunk_index": i,
                    "title": metadata.title,
                    "source": metadata.source,
                    "author": metadata.author,
                    "category": metadata.category,
                    "tags": metadata.tags
                }
                vectors.append((vector_id, embedding, chunk_metadata))
            
            # Store document in Supabase
            await self.supabase_client.store_document(content, metadata, chunks)
            
            # Store vectors in Pinecone
            await self.vector_db_client.upsert_vectors(vectors)
            
            processing_time = time.time() - start_time
            logger.info(f"Uploaded document {metadata.id} with {len(chunks)} chunks in {processing_time:.2f}s")
            
            return metadata.id
            
        except Exception as e:
            logger.error(f"Failed to upload document: {e}")
            raise
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its vectors."""
        try:
            # Get all vector IDs for this document
            # Note: In production, you'd want to store vector IDs in Supabase
            # For now, we'll use a naming convention
            vector_ids = [f"{document_id}_chunk_{i}" for i in range(1000)]  # Assume max 1000 chunks
            
            # Delete from Pinecone
            await self.vector_db_client.delete_vectors(vector_ids)
            
            # Delete from Supabase
            success = await self.supabase_client.delete_document(document_id)
            
            logger.info(f"Deleted document {document_id}")
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            raise
    
    async def search_documents(
        self, 
        query: str,
        filters: Optional[SearchFilters] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[RetrievedDocument]:
        """Search documents with optional filters."""
        try:
            # First, get documents from Supabase with filters
            supabase_docs = await self.supabase_client.search_documents(filters.__dict__ if filters else None)
            
            if not supabase_docs:
                return []
            
            # Get document IDs for vector search
            doc_ids = [doc["id"] for doc in supabase_docs]
            
            # Generate query embedding
            query_embedding = await self.vector_db_client.embed_text(query)
            
            # Search vectors with document ID filter
            vector_filter = {"document_id": {"$in": doc_ids}}
            search_results = await self.vector_db_client.search_similar(
                query_embedding=query_embedding,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                filter_dict=vector_filter
            )
            
            # Convert to RetrievedDocument objects
            retrieved_docs = []
            for result in search_results:
                # Find corresponding Supabase document
                supabase_doc = next((doc for doc in supabase_docs if doc["id"] == result["id"]), None)
                
                if supabase_doc:
                    metadata = DocumentMetadata(
                        id=supabase_doc["id"],
                        title=supabase_doc.get("title"),
                        source=supabase_doc.get("source"),
                        author=supabase_doc.get("author"),
                        created_at=supabase_doc.get("created_at"),
                        updated_at=supabase_doc.get("updated_at"),
                        tags=supabase_doc.get("tags", []),
                        category=supabase_doc.get("category")
                    )
                    
                    doc = RetrievedDocument(
                        id=result["id"],
                        content=result["metadata"].get("content", ""),
                        metadata=metadata,
                        similarity_score=result["score"],
                        chunk_index=result["metadata"].get("chunk_index")
                    )
                    retrieved_docs.append(doc)
            
            return retrieved_docs
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    async def get_document_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID."""
        try:
            return await self.supabase_client.get_document(document_id)
        except Exception as e:
            logger.error(f"Failed to get document: {e}")
            raise
    
    async def update_document_metadata(
        self, 
        document_id: str, 
        metadata: DocumentMetadata
    ) -> bool:
        """Update document metadata."""
        try:
            return await self.supabase_client.update_document_metadata(document_id, metadata)
        except Exception as e:
            logger.error(f"Failed to update document metadata: {e}")
            raise
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics."""
        try:
            # Get vector database stats
            vector_stats = await self.vector_db_client.get_index_stats()
            
            # Get Supabase stats
            supabase_stats = await self.supabase_client.get_document_stats()
            
            return {
                "vector_database": vector_stats,
                "document_database": supabase_stats,
                "total_vectors": vector_stats.get("total_vector_count", 0),
                "total_documents": supabase_stats.get("total_documents", 0),
                "total_chunks": supabase_stats.get("total_chunks", 0)
            }
            
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            raise
    
    async def health_check(self) -> Dict[str, bool]:
        """Check health of all components."""
        try:
            vector_health = await self.vector_db_client.health_check()
            supabase_health = await self.supabase_client.health_check()
            
            return {
                "vector_database": vector_health,
                "document_database": supabase_health,
                "overall": vector_health and supabase_health
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "vector_database": False,
                "document_database": False,
                "overall": False
            }
    
    async def batch_upload_documents(
        self, 
        documents: List[Tuple[str, DocumentMetadata]]
    ) -> List[str]:
        """Upload multiple documents in batch."""
        try:
            document_ids = []
            
            for content, metadata in documents:
                doc_id = await self.upload_document(content, metadata)
                document_ids.append(doc_id)
            
            logger.info(f"Batch uploaded {len(document_ids)} documents")
            return document_ids
            
        except Exception as e:
            logger.error(f"Failed to batch upload documents: {e}")
            raise
    
    async def reindex_document(self, document_id: str) -> bool:
        """Reindex a document (useful after metadata updates)."""
        try:
            # Get document from Supabase
            document_data = await self.supabase_client.get_document(document_id)
            if not document_data:
                return False
            
            # Get chunks
            chunks = await self.supabase_client.get_document_chunks(document_id)
            
            # Delete existing vectors
            vector_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            await self.vector_db_client.delete_vectors(vector_ids)
            
            # Re-embed and store chunks
            chunk_contents = [chunk["content"] for chunk in chunks]
            chunk_embeddings = await self.vector_db_client.embed_texts(chunk_contents)
            
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
                vector_id = f"{document_id}_chunk_{i}"
                chunk_metadata = {
                    "content": chunk["content"],
                    "document_id": document_id,
                    "chunk_index": i,
                    "title": document_data.get("title"),
                    "source": document_data.get("source"),
                    "author": document_data.get("author"),
                    "category": document_data.get("category"),
                    "tags": document_data.get("tags", [])
                }
                vectors.append((vector_id, embedding, chunk_metadata))
            
            await self.vector_db_client.upsert_vectors(vectors)
            
            logger.info(f"Reindexed document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reindex document: {e}")
            raise


# Global RAG service instance
rag_service = RAGService()


async def get_rag_service() -> RAGService:
    """Get the global RAG service instance."""
    return rag_service
