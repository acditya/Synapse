"""
Main FastAPI application for the Synapse Grant Triage System.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from dotenv import load_dotenv

from .api import grants, reviewers, triage, compliance
from .database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Synapse Grant Triage System",
    description="AI-powered grant triage system for NMSS research proposals",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(grants.router, prefix="/api/grants", tags=["grants"])
app.include_router(reviewers.router, prefix="/api/reviewers", tags=["reviewers"])
app.include_router(triage.router, prefix="/api/triage", tags=["triage"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["compliance"])

# Serve uploaded files
if os.path.exists("./uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with basic information."""
    return """
    <html>
        <head>
            <title>Synapse Grant Triage System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { color: #2E7D32; }
                .link { color: #1976D2; text-decoration: none; }
                .link:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1 class="header">Synapse Grant Triage System</h1>
            <p>AI-powered grant triage system for NMSS research proposals</p>
            <ul>
                <li><a href="/api/docs" class="link">API Documentation (Swagger)</a></li>
                <li><a href="/api/redoc" class="link">API Documentation (ReDoc)</a></li>
                <li><a href="/api/grants" class="link">Grants API</a></li>
                <li><a href="/api/reviewers" class="link">Reviewers API</a></li>
            </ul>
        </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "synapse-grant-triage"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)