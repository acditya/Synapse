"""
Pinecone vector database integration utilities.
Handles vector operations, embeddings, and similarity search.
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from loguru import logger
import time

from ..config import settings, PINECONE_CONFIG


class VectorDBClient:
    """Pinecone vector database client for RAG operations."""
    
    def __init__(self):
        """Initialize the vector database client."""
        self.pc = None
        self.index = None
        self.embedding_model = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Pinecone client and index."""
        try:
            # Initialize Pinecone client
            self.pc = Pinecone(api_key=PINECONE_CONFIG["api_key"])
            
            # Get or create index
            index_name = PINECONE_CONFIG["index_name"]
            if index_name not in [index.name for index in self.pc.list_indexes()]:
                logger.info(f"Creating Pinecone index: {index_name}")
                self.pc.create_index(
                    name=index_name,
                    dimension=settings.embedding_dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                # Wait for index to be ready
                time.sleep(10)
            
            # Connect to index
            self.index = self.pc.Index(index_name)
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer(settings.embedding_model)
            logger.info(f"VectorDB client initialized with index: {index_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize VectorDB client: {e}")
            raise
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        try:
            embedding = self.embedding_model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            embeddings = self.embedding_model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    async def upsert_vectors(
        self, 
        vectors: List[Tuple[str, List[float], Dict[str, Any]]]
    ) -> None:
        """Upsert vectors to the index."""
        try:
            # Prepare vectors for upsert
            upsert_vectors = []
            for vector_id, embedding, metadata in vectors:
                upsert_vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Batch upsert
            batch_size = 100
            for i in range(0, len(upsert_vectors), batch_size):
                batch = upsert_vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
            
            logger.info(f"Upserted {len(vectors)} vectors to index")
            
        except Exception as e:
            logger.error(f"Failed to upsert vectors: {e}")
            raise
    
    async def search_similar(
        self, 
        query_embedding: List[float], 
        top_k: int = 5,
        similarity_threshold: float = 0.7,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors."""
        try:
            # Perform similarity search
            search_response = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Filter by similarity threshold
            results = []
            for match in search_response.matches:
                if match.score >= similarity_threshold:
                    results.append({
                        "id": match.id,
                        "score": match.score,
                        "metadata": match.metadata
                    })
            
            logger.info(f"Found {len(results)} similar vectors above threshold {similarity_threshold}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search similar vectors: {e}")
            raise
    
    async def delete_vectors(self, vector_ids: List[str]) -> None:
        """Delete vectors by IDs."""
        try:
            self.index.delete(ids=vector_ids)
            logger.info(f"Deleted {len(vector_ids)} vectors from index")
        except Exception as e:
            logger.error(f"Failed to delete vectors: {e}")
            raise
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get index statistics."""
        try:
            stats = self.index.describe_index_stats()
            return {
                "total_vector_count": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness,
                "namespaces": dict(stats.namespaces) if stats.namespaces else {}
            }
        except Exception as e:
            logger.error(f"Failed to get index stats: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if the vector database is healthy."""
        try:
            stats = await self.get_index_stats()
            return stats["total_vector_count"] >= 0
        except Exception as e:
            logger.error(f"Vector database health check failed: {e}")
            return False


# Global vector database client instance
vector_db_client = VectorDBClient()


async def get_vector_db_client() -> VectorDBClient:
    """Get the global vector database client."""
    return vector_db_client
