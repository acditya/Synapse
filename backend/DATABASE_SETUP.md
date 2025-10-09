# Database Setup Guide

This guide provides step-by-step instructions for setting up the required databases for the RAG Evaluation API.

## Overview

The RAG Evaluation API requires two main databases:

1. **Supabase (PostgreSQL)** - For document storage and metadata
2. **Pinecone** - For vector embeddings and semantic search

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `rag-evaluation-api`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

### 2. Get API Keys

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - `Project URL` (for `SUPABASE_URL`)
   - `anon public` key (for `SUPABASE_ANON_KEY`)
   - `service_role` key (for `SUPABASE_SERVICE_KEY`)

### 3. Create Database Tables

Run the following SQL commands in the Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    source TEXT,
    author TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    category TEXT
);

-- Document chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_document_chunks_created_at ON document_chunks(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for documents table
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO documents (id, title, source, author, content, tags, category) VALUES
('sample_doc_1', 'Introduction to Machine Learning', 'academic_paper', 'AI Researcher', 
 'Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models...', 
 ARRAY['machine_learning', 'ai', 'algorithms'], 'technology'),
('sample_doc_2', 'Deep Learning Fundamentals', 'textbook', 'ML Expert', 
 'Deep learning is a subset of machine learning that uses neural networks with multiple layers...', 
 ARRAY['deep_learning', 'neural_networks', 'ai'], 'technology');

-- Insert sample chunks
INSERT INTO document_chunks (document_id, chunk_index, content, metadata) VALUES
('sample_doc_1', 0, 'Machine learning is a subset of artificial intelligence...', '{"chunk_type": "introduction"}'),
('sample_doc_1', 1, 'The field includes supervised learning, unsupervised learning...', '{"chunk_type": "content"}'),
('sample_doc_2', 0, 'Deep learning is a subset of machine learning...', '{"chunk_type": "introduction"}'),
('sample_doc_2', 1, 'Neural networks are inspired by biological neural networks...', '{"chunk_type": "content"}');
```

### 4. Configure Row Level Security (RLS)

```sql
-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public access to documents" ON documents
    FOR ALL USING (true);

-- Enable RLS on document_chunks table
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to chunks
CREATE POLICY "Allow public access to document_chunks" ON document_chunks
    FOR ALL USING (true);
```

## Pinecone Setup

### 1. Create Pinecone Account

1. Go to [pinecone.io](https://pinecone.io)
2. Sign up for a free account
3. Verify your email address

### 2. Create API Key

1. Go to your Pinecone dashboard
2. Navigate to API Keys
3. Click "Create API Key"
4. Name it: `rag-evaluation-api`
5. Copy the API key

### 3. Create Vector Index

#### Option A: Using Pinecone Console

1. Go to your Pinecone dashboard
2. Click "Create Index"
3. Configure the index:
   - **Name**: `rag-documents`
   - **Dimensions**: `384` (for sentence-transformers/all-MiniLM-L6-v2)
   - **Metric**: `cosine`
   - **Cloud**: `AWS`
   - **Region**: `us-east-1` (or your preferred region)
4. Click "Create Index"

#### Option B: Using Python Script

```python
import pinecone
from pinecone import ServerlessSpec

# Initialize Pinecone
pinecone.init(api_key="your-api-key", environment="us-east-1")

# Create index
pinecone.create_index(
    name="rag-documents",
    dimension=384,
    metric="cosine",
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)

print("Index created successfully!")
```

### 4. Test Index Connection

```python
import pinecone

# Initialize Pinecone
pinecone.init(api_key="your-api-key", environment="us-east-1")

# Connect to index
index = pinecone.Index("rag-documents")

# Test connection
print(f"Index stats: {index.describe_index_stats()}")
```

## Environment Configuration

### 1. Create Environment File

Create a `.env` file in the backend directory:

```env
# Application Configuration
DEBUG=false
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=rag-documents

# Llama 3.2 Configuration
LLAMA_MODEL_PATH=/path/to/llama-3.2-3b-instruct.gguf
LLAMA_N_CTX=4096
LLAMA_N_GPU_LAYERS=0
LLAMA_TEMPERATURE=0.7
LLAMA_MAX_TOKENS=2048

# Embedding Configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# RAG Configuration
RETRIEVAL_TOP_K=5
SIMILARITY_THRESHOLD=0.7
MAX_CONTEXT_LENGTH=4000

# Evaluation Configuration
EVALUATION_CRITERIA=["relevance","accuracy","completeness","consistency","clarity"]

# CORS Configuration
CORS_ORIGINS=["*"]
CORS_METHODS=["GET","POST","PUT","DELETE"]
CORS_HEADERS=["*"]
```

### 2. Download Llama 3.2 Model

```bash
# Create models directory
mkdir -p models

# Download Llama 3.2 3B Instruct model (GGUF format)
# You can use huggingface-hub or download manually
pip install huggingface-hub

# Download model
python -c "
from huggingface_hub import hf_hub_download
import os

model_path = hf_hub_download(
    repo_id='microsoft/DialoGPT-medium',
    filename='pytorch_model.bin',
    cache_dir='./models'
)
print(f'Model downloaded to: {model_path}')
"

# Or download manually from:
# https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct-GGUF
```

## Verification

### 1. Test Database Connections

Create a test script `test_connections.py`:

```python
import asyncio
import os
from dotenv import load_dotenv
from app.utils.supabase_client import get_supabase_client
from app.utils.vector_db import get_vector_db_client

async def test_connections():
    load_dotenv()
    
    # Test Supabase connection
    try:
        supabase = await get_supabase_client()
        result = await supabase.health_check()
        print(f"✅ Supabase connection: {result}")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
    
    # Test Pinecone connection
    try:
        vector_db = await get_vector_db_client()
        result = await vector_db.health_check()
        print(f"✅ Pinecone connection: {result}")
    except Exception as e:
        print(f"❌ Pinecone connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connections())
```

Run the test:

```bash
python test_connections.py
```

### 2. Test API Endpoints

```bash
# Start the API
python -m uvicorn app.main:app --reload

# Test health endpoint
curl http://localhost:8000/health

# Test API health
curl http://localhost:8000/api/v1/health
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Check your project URL and API keys
   - Ensure RLS policies are configured correctly
   - Verify the tables were created successfully

2. **Pinecone Connection Failed**
   - Verify your API key is correct
   - Check that the index exists and is active
   - Ensure the index dimensions match (384)

3. **Model Loading Issues**
   - Verify the model path is correct
   - Check that the model file exists and is accessible
   - Ensure you have enough memory/disk space

4. **Permission Issues**
   - Check file permissions for the model file
   - Ensure the application has read access to the model directory

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=true
export LOG_LEVEL=DEBUG
python -m uvicorn app.main:app --reload --log-level debug
```

## Production Considerations

### Security

1. **API Keys**: Store sensitive keys in environment variables or secret management systems
2. **RLS Policies**: Configure appropriate row-level security policies
3. **CORS**: Configure CORS origins for production domains
4. **Rate Limiting**: Implement rate limiting for production use

### Performance

1. **Database Indexes**: Ensure all necessary indexes are created
2. **Connection Pooling**: Configure connection pooling for databases
3. **Caching**: Implement caching for frequently accessed data
4. **Monitoring**: Set up monitoring and alerting

### Scaling

1. **Database Scaling**: Consider Supabase Pro for higher limits
2. **Vector Database**: Upgrade Pinecone plan for higher throughput
3. **Load Balancing**: Deploy multiple API instances
4. **CDN**: Use CDN for static assets

## Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test database connections individually
4. Review the API documentation
5. Open an issue on GitHub with detailed error information
