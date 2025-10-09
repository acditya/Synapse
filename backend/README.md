# RAG Evaluation API

A comprehensive FastAPI backend implementing a full RAG (Retrieval-Augmented Generation) pipeline with LLM evaluation using **Llama 3.2**, **LangChain**, **Supabase**, and **Pinecone**.

## Features

- **RAG Pipeline**: Complete retrieval-augmented generation with semantic search
- **LLM Evaluation**: Document evaluation using Llama 3.2 with multiple criteria
- **Vector Search**: Pinecone integration for semantic similarity search
- **Document Management**: Supabase integration for document storage and metadata
- **Batch Processing**: Support for batch RAG queries and evaluations
- **Advanced Filtering**: Document search with filters and reranking
- **Comprehensive Testing**: Full test suite with unit, integration, and end-to-end tests

## Architecture

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration and settings
│   ├── api/
│   │   ├── routes.py          # API endpoints
│   │   └── dependencies.py    # Shared dependencies
│   ├── services/
│   │   ├── rag_service.py     # RAG operations
│   │   ├── llm_service.py     # LLM operations
│   │   └── evaluation_pipeline.py # End-to-end pipeline
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   └── utils/
│       ├── vector_db.py        # Pinecone integration
│       ├── supabase_client.py # Supabase integration
│       ├── prompt_templates.py # LLM prompts
│       └── langchain_utils.py # LangChain utilities
├── tests/                     # Test suite
├── requirements.txt           # Dependencies
└── README.md                  # This file
```

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Configuration

Update the `.env` file with your API keys and settings:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=rag-documents

# Llama 3.2 Configuration
LLAMA_MODEL_PATH=/path/to/llama-3.2-3b-instruct.gguf
LLAMA_N_CTX=4096
LLAMA_N_GPU_LAYERS=0
LLAMA_TEMPERATURE=0.7
LLAMA_MAX_TOKENS=2048
```

### 4. Database Setup

#### Supabase Setup

1. Create a new Supabase project
2. Run the following SQL to create required tables:

```sql
-- Documents table
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    source TEXT,
    author TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[],
    category TEXT
);

-- Document chunks table
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,
    document_id TEXT REFERENCES documents(id),
    chunk_index INTEGER,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_source ON documents(source);
CREATE INDEX idx_documents_author ON documents(author);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
```

#### Pinecone Setup

1. Create a Pinecone account and get your API key
2. Create an index with the following specifications:
   - Name: `rag-documents` (or update `PINECONE_INDEX_NAME`)
   - Dimension: `384` (for sentence-transformers/all-MiniLM-L6-v2)
   - Metric: `cosine`

### 5. Run the Application

```bash
# Development mode
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### RAG Operations

- `POST /api/v1/rag/query` - Process a RAG query with optional evaluation
- `POST /api/v1/rag/evaluate` - Evaluate a document using LLM
- `POST /api/v1/rag/batch` - Process multiple RAG queries in batch
- `POST /api/v1/rag/advanced` - Advanced RAG with filters and reranking

### Document Management

- `POST /api/v1/documents/upload` - Upload and index a new document
- `GET /api/v1/documents/{document_id}` - Get a document by ID
- `DELETE /api/v1/documents/{document_id}` - Delete a document
- `POST /api/v1/documents/{document_id}/reindex` - Reindex a document

### System Operations

- `GET /api/v1/health` - System health check
- `GET /api/v1/metrics` - System metrics and statistics
- `GET /api/v1/insights/{query}` - Generate insights from a query
- `POST /api/v1/compare` - Compare multiple documents

## Usage Examples

### 1. Basic RAG Query

```python
import requests

# Query with evaluation
response = requests.post("http://localhost:8000/api/v1/rag/query", json={
    "query": "What is machine learning?",
    "top_k": 5,
    "similarity_threshold": 0.7,
    "include_evaluation": True,
    "evaluation_criteria": ["relevance", "accuracy"]
})

result = response.json()
print(f"Found {result['total_documents_found']} documents")
print(f"Overall score: {result['evaluation']['overall_score']}")
```

### 2. Document Upload

```python
# Upload a document
response = requests.post("http://localhost:8000/api/v1/documents/upload", json={
    "content": "Machine learning is a subset of artificial intelligence...",
    "metadata": {
        "id": "ml_doc_001",
        "title": "Introduction to Machine Learning",
        "source": "academic_textbook",
        "author": "AI Professor",
        "tags": ["machine_learning", "ai"],
        "category": "technology"
    },
    "chunk_size": 1000,
    "chunk_overlap": 200
})

result = response.json()
print(f"Document ID: {result['document_id']}")
```

### 3. Document Evaluation

```python
# Evaluate a document
response = requests.post("http://localhost:8000/api/v1/rag/evaluate", json={
    "document_content": "This document explains machine learning concepts...",
    "evaluation_criteria": ["relevance", "accuracy", "completeness"],
    "context": "Educational material for beginners"
})

result = response.json()
evaluation = result['evaluation']
print(f"Overall score: {evaluation['overall_score']}")
print(f"Strengths: {evaluation['strengths']}")
print(f"Recommendations: {evaluation['recommendations']}")
```

### 4. Batch Processing

```python
# Process multiple queries
response = requests.post("http://localhost:8000/api/v1/rag/batch", json={
    "queries": [
        "What is supervised learning?",
        "How does deep learning work?",
        "What are neural networks?"
    ],
    "top_k": 3,
    "similarity_threshold": 0.7,
    "include_evaluation": True
})

result = response.json()
print(f"Processed {result['successful_queries']} queries successfully")
```

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m slow          # Slow tests only

# Run with coverage
pytest --cov=app --cov-report=html
```

### Test Categories

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `false` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `RETRIEVAL_TOP_K` | Default number of documents to retrieve | `5` |
| `SIMILARITY_THRESHOLD` | Minimum similarity threshold | `0.7` |
| `MAX_CONTEXT_LENGTH` | Maximum context length for LLM | `4000` |

### Model Configuration

- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **LLM Model**: Llama 3.2 3B Instruct (GGUF format)
- **Vector Database**: Pinecone with cosine similarity
- **Document Database**: Supabase PostgreSQL

## Performance Considerations

### Optimization Tips

1. **Batch Processing**: Use batch endpoints for multiple queries
2. **Chunk Size**: Optimize document chunk size for your use case
3. **Similarity Threshold**: Adjust threshold based on your requirements
4. **GPU Acceleration**: Use GPU layers for Llama 3.2 if available
5. **Caching**: Implement caching for frequently accessed documents

### Scaling

- **Horizontal Scaling**: Deploy multiple instances behind a load balancer
- **Database Scaling**: Use Supabase Pro for higher limits
- **Vector Database**: Upgrade Pinecone plan for higher throughput
- **LLM Scaling**: Use multiple LLM instances with load balancing

## Troubleshooting

### Common Issues

1. **Model Loading Errors**: Ensure Llama 3.2 model path is correct
2. **Vector Database Connection**: Check Pinecone API key and environment
3. **Document Database Connection**: Verify Supabase URL and keys
4. **Memory Issues**: Reduce `LLAMA_N_CTX` or use smaller model
5. **Performance Issues**: Check similarity threshold and top_k values

### Debug Mode

```bash
# Enable debug mode
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run with debug logging
python -m uvicorn app.main:app --reload --log-level debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

1. Check the documentation
2. Review the test cases for usage examples
3. Open an issue on GitHub
4. Contact the development team

## Changelog

### Version 1.0.0

- Initial release
- Complete RAG pipeline implementation
- Llama 3.2 integration
- Pinecone and Supabase integration
- Comprehensive test suite
- Full API documentation
