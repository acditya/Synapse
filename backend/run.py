#!/usr/bin/env python3
"""
Run script for the RAG Evaluation API.
Provides easy startup with proper configuration.
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_settings


def main():
    """Main entry point for the application."""
    # Get settings
    settings = get_settings()
    
    # Print startup information
    print("🚀 Starting RAG Evaluation API...")
    print(f"📊 Debug mode: {settings.debug}")
    print(f"🌐 Host: {settings.host}")
    print(f"🔌 Port: {settings.port}")
    print(f"📝 Log level: {settings.log_level}")
    
    # Check for required environment variables
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY", 
        "PINECONE_API_KEY",
        "LLAMA_MODEL_PATH"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your .env file or environment configuration.")
        sys.exit(1)
    
    print("✅ Environment configuration validated")
    
    # Start the server
    try:
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level=settings.log_level.lower(),
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down RAG Evaluation API...")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
