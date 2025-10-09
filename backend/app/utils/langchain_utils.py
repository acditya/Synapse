"""
LangChain utilities for RAG pipeline implementation.
Handles chains, retrievers, and agent setup for Llama 3.2 integration.
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from langchain.llms import LlamaCpp
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA, LLMChain
from langchain.retrievers import BaseRetriever
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.callbacks.manager import CallbackManagerForRetrieverRun
from loguru import logger

from ..config import settings, LLAMA_CONFIG
from ..utils.vector_db import get_vector_db_client
from ..utils.prompt_templates import (
    SUMMARY_PROMPT,
    EVALUATION_PROMPT,
    CONSISTENCY_CHECK_PROMPT,
    RELEVANCE_PROMPT,
    create_custom_evaluation_prompt
)


class CustomPineconeRetriever(BaseRetriever):
    """Custom Pinecone retriever for LangChain integration."""
    
    def __init__(self, vector_db_client, top_k: int = 5, similarity_threshold: float = 0.7):
        """Initialize the retriever."""
        self.vector_db_client = vector_db_client
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold
    
    def _get_relevant_documents(
        self, 
        query: str, 
        *, 
        run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Retrieve relevant documents synchronously."""
        try:
            # This is a sync method, but we need async functionality
            # We'll use asyncio.run for now, but in production you'd want proper async handling
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(self._async_get_relevant_documents(query))
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {e}")
            return []
    
    async def _async_get_relevant_documents(self, query: str) -> List[Document]:
        """Retrieve relevant documents asynchronously."""
        try:
            # Generate query embedding
            query_embedding = await self.vector_db_client.embed_text(query)
            
            # Search for similar vectors
            results = await self.vector_db_client.search_similar(
                query_embedding=query_embedding,
                top_k=self.top_k,
                similarity_threshold=self.similarity_threshold
            )
            
            # Convert to LangChain documents
            documents = []
            for result in results:
                doc = Document(
                    page_content=result["metadata"].get("content", ""),
                    metadata={
                        "id": result["id"],
                        "score": result["score"],
                        **result["metadata"]
                    }
                )
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {e}")
            return []


class LangChainRAGPipeline:
    """LangChain-based RAG pipeline for document retrieval and evaluation."""
    
    def __init__(self):
        """Initialize the RAG pipeline."""
        self.llm = None
        self.embeddings = None
        self.retriever = None
        self.vector_db_client = None
        self._initialize_components()
    
    def _initialize_components(self) -> None:
        """Initialize LangChain components."""
        try:
            # Initialize Llama 3.2 LLM
            self.llm = LlamaCpp(
                model_path=LLAMA_CONFIG["model_path"],
                n_ctx=LLAMA_CONFIG["n_ctx"],
                n_gpu_layers=LLAMA_CONFIG["n_gpu_layers"],
                temperature=LLAMA_CONFIG["temperature"],
                max_tokens=LLAMA_CONFIG["max_tokens"],
                verbose=LLAMA_CONFIG["verbose"]
            )
            
            # Initialize embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name=settings.embedding_model,
                model_kwargs={'device': 'cpu'}
            )
            
            # Initialize vector DB client
            self.vector_db_client = get_vector_db_client()
            
            # Initialize retriever
            self.retriever = CustomPineconeRetriever(
                vector_db_client=self.vector_db_client,
                top_k=settings.retrieval_top_k,
                similarity_threshold=settings.similarity_threshold
            )
            
            logger.info("LangChain RAG pipeline initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize LangChain components: {e}")
            raise
    
    async def retrieve_documents(self, query: str, top_k: Optional[int] = None) -> List[Document]:
        """Retrieve relevant documents for a query."""
        try:
            if top_k:
                self.retriever.top_k = top_k
            
            documents = await self.retriever._async_get_relevant_documents(query)
            logger.info(f"Retrieved {len(documents)} documents for query: {query[:50]}...")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {e}")
            return []
    
    async def summarize_document(self, content: str, max_length: int = 500) -> str:
        """Summarize a document using Llama 3.2."""
        try:
            # Create summarization chain
            summary_chain = LLMChain(
                llm=self.llm,
                prompt=SUMMARY_PROMPT
            )
            
            # Generate summary
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: summary_chain.run(
                    document_content=content,
                    max_length=max_length
                )
            )
            
            return result.strip()
            
        except Exception as e:
            logger.error(f"Failed to summarize document: {e}")
            return "Summary generation failed."
    
    async def evaluate_document(
        self, 
        content: str, 
        criteria: Optional[List[str]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate a document using Llama 3.2."""
        try:
            # Prepare evaluation criteria
            if not criteria:
                criteria = [c.value for c in settings.evaluation_criteria]
            
            criteria_text = "\n".join([f"- {criterion}" for criterion in criteria])
            
            # Create evaluation chain
            evaluation_chain = LLMChain(
                llm=self.llm,
                prompt=EVALUATION_PROMPT
            )
            
            # Generate evaluation
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: evaluation_chain.run(
                    document_content=content,
                    evaluation_criteria=criteria_text,
                    context=context or "No additional context provided."
                )
            )
            
            # Parse JSON result (in production, you'd want more robust JSON parsing)
            try:
                import json
                evaluation_data = json.loads(result)
                return evaluation_data
            except json.JSONDecodeError:
                # Fallback to text parsing if JSON parsing fails
                return {
                    "overall_score": 5.0,
                    "summary": result,
                    "criterion_scores": [],
                    "strengths": [],
                    "weaknesses": [],
                    "recommendations": []
                }
            
        except Exception as e:
            logger.error(f"Failed to evaluate document: {e}")
            return {
                "overall_score": 0.0,
                "summary": "Evaluation failed.",
                "criterion_scores": [],
                "strengths": [],
                "weaknesses": [],
                "recommendations": []
            }
    
    async def check_consistency(
        self, 
        main_content: str, 
        reference_documents: List[Document]
    ) -> Dict[str, Any]:
        """Check consistency between main document and references."""
        try:
            # Prepare reference documents text
            ref_text = "\n\n".join([
                f"Reference {i+1}:\n{doc.page_content[:500]}..."
                for i, doc in enumerate(reference_documents)
            ])
            
            # Create consistency check chain
            consistency_chain = LLMChain(
                llm=self.llm,
                prompt=CONSISTENCY_CHECK_PROMPT
            )
            
            # Generate consistency analysis
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: consistency_chain.run(
                    document_content=main_content,
                    retrieved_documents=ref_text
                )
            )
            
            # Parse JSON result
            try:
                import json
                consistency_data = json.loads(result)
                return consistency_data
            except json.JSONDecodeError:
                return {
                    "consistency_score": 5.0,
                    "contradictions": [],
                    "inconsistencies": [],
                    "missing_context": [],
                    "recommendations": []
                }
            
        except Exception as e:
            logger.error(f"Failed to check consistency: {e}")
            return {
                "consistency_score": 0.0,
                "contradictions": [],
                "inconsistencies": [],
                "missing_context": [],
                "recommendations": []
            }
    
    async def score_relevance(
        self, 
        query: str, 
        content: str, 
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Score the relevance of content to a query."""
        try:
            # Create relevance scoring chain
            relevance_chain = LLMChain(
                llm=self.llm,
                prompt=RELEVANCE_PROMPT
            )
            
            # Generate relevance score
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: relevance_chain.run(
                    query=query,
                    document_content=content,
                    context=context or "No additional context provided."
                )
            )
            
            # Parse result (simplified parsing)
            lines = result.strip().split('\n')
            score = 5.0
            reasoning = "Relevance analysis completed."
            
            for line in lines:
                if "Relevance Score:" in line:
                    try:
                        score = float(line.split(":")[1].strip())
                    except:
                        pass
                elif "Reasoning:" in line:
                    reasoning = line.split(":", 1)[1].strip()
            
            return {
                "score": score,
                "reasoning": reasoning,
                "raw_response": result
            }
            
        except Exception as e:
            logger.error(f"Failed to score relevance: {e}")
            return {
                "score": 0.0,
                "reasoning": "Relevance scoring failed.",
                "raw_response": ""
            }
    
    async def create_retrieval_qa_chain(self) -> RetrievalQA:
        """Create a RetrievalQA chain for question answering."""
        try:
            chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever,
                return_source_documents=True
            )
            return chain
            
        except Exception as e:
            logger.error(f"Failed to create RetrievalQA chain: {e}")
            raise
    
    def create_text_splitter(
        self, 
        chunk_size: int = 1000, 
        chunk_overlap: int = 200
    ) -> RecursiveCharacterTextSplitter:
        """Create a text splitter for document chunking."""
        return RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )


# Global RAG pipeline instance
rag_pipeline = LangChainRAGPipeline()


async def get_rag_pipeline() -> LangChainRAGPipeline:
    """Get the global RAG pipeline instance."""
    return rag_pipeline
