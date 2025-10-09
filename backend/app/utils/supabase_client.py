"""
Supabase client integration utilities.
Handles document storage, metadata management, and relational queries.
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from supabase import create_client, Client
from loguru import logger

from ..config import settings, SUPABASE_CONFIG
from ..models.schemas import DocumentMetadata


class SupabaseClient:
    """Supabase client for document and metadata management."""
    
    def __init__(self):
        """Initialize the Supabase client."""
        self.client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Supabase client."""
        try:
            self.client = create_client(
                SUPABASE_CONFIG["url"],
                SUPABASE_CONFIG["key"]
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    async def store_document(
        self, 
        content: str, 
        metadata: DocumentMetadata,
        chunks: List[Dict[str, Any]]
    ) -> str:
        """Store a document and its chunks in Supabase."""
        try:
            # Store main document
            document_data = {
                "id": metadata.id,
                "title": metadata.title,
                "source": metadata.source,
                "author": metadata.author,
                "content": content,
                "created_at": metadata.created_at or datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "tags": metadata.tags,
                "category": metadata.category
            }
            
            result = self.client.table("documents").insert(document_data).execute()
            
            if result.data:
                logger.info(f"Stored document: {metadata.id}")
                
                # Store chunks
                if chunks:
                    await self._store_chunks(metadata.id, chunks)
                
                return metadata.id
            else:
                raise Exception("Failed to store document")
                
        except Exception as e:
            logger.error(f"Failed to store document: {e}")
            raise
    
    async def _store_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> None:
        """Store document chunks."""
        try:
            chunk_data = []
            for i, chunk in enumerate(chunks):
                chunk_data.append({
                    "document_id": document_id,
                    "chunk_index": i,
                    "content": chunk["content"],
                    "metadata": chunk.get("metadata", {}),
                    "created_at": datetime.utcnow().isoformat()
                })
            
            result = self.client.table("document_chunks").insert(chunk_data).execute()
            
            if result.data:
                logger.info(f"Stored {len(chunks)} chunks for document: {document_id}")
            else:
                raise Exception("Failed to store chunks")
                
        except Exception as e:
            logger.error(f"Failed to store chunks: {e}")
            raise
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID."""
        try:
            result = self.client.table("documents").select("*").eq("id", document_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get document: {e}")
            raise
    
    async def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a document."""
        try:
            result = self.client.table("document_chunks").select("*").eq("document_id", document_id).order("chunk_index").execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Failed to get document chunks: {e}")
            raise
    
    async def search_documents(
        self, 
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Search documents with filters."""
        try:
            query = self.client.table("documents").select("*")
            
            if filters:
                if "sources" in filters:
                    query = query.in_("source", filters["sources"])
                if "authors" in filters:
                    query = query.in_("author", filters["authors"])
                if "categories" in filters:
                    query = query.in_("category", filters["categories"])
                if "tags" in filters:
                    query = query.overlaps("tags", filters["tags"])
                if "date_from" in filters:
                    query = query.gte("created_at", filters["date_from"])
                if "date_to" in filters:
                    query = query.lte("created_at", filters["date_to"])
            
            result = query.limit(limit).execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    async def update_document_metadata(
        self, 
        document_id: str, 
        metadata: DocumentMetadata
    ) -> bool:
        """Update document metadata."""
        try:
            update_data = {
                "title": metadata.title,
                "source": metadata.source,
                "author": metadata.author,
                "updated_at": datetime.utcnow().isoformat(),
                "tags": metadata.tags,
                "category": metadata.category
            }
            
            result = self.client.table("documents").update(update_data).eq("id", document_id).execute()
            
            if result.data:
                logger.info(f"Updated metadata for document: {document_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to update document metadata: {e}")
            raise
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its chunks."""
        try:
            # Delete chunks first
            self.client.table("document_chunks").delete().eq("document_id", document_id).execute()
            
            # Delete document
            result = self.client.table("documents").delete().eq("id", document_id).execute()
            
            if result.data:
                logger.info(f"Deleted document: {document_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            raise
    
    async def get_document_stats(self) -> Dict[str, Any]:
        """Get document statistics."""
        try:
            # Get total document count
            doc_result = self.client.table("documents").select("id", count="exact").execute()
            total_documents = doc_result.count or 0
            
            # Get total chunk count
            chunk_result = self.client.table("document_chunks").select("id", count="exact").execute()
            total_chunks = chunk_result.count or 0
            
            # Get category distribution
            category_result = self.client.table("documents").select("category").execute()
            categories = {}
            for doc in category_result.data or []:
                cat = doc.get("category")
                if cat:
                    categories[cat] = categories.get(cat, 0) + 1
            
            return {
                "total_documents": total_documents,
                "total_chunks": total_chunks,
                "category_distribution": categories
            }
            
        except Exception as e:
            logger.error(f"Failed to get document stats: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if Supabase is healthy."""
        try:
            result = self.client.table("documents").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Supabase health check failed: {e}")
            return False


# Global Supabase client instance
supabase_client = SupabaseClient()


async def get_supabase_client() -> SupabaseClient:
    """Get the global Supabase client."""
    return supabase_client
