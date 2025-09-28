#!/usr/bin/env python3
"""
Simple test server for Synapse Grant Triage System
This is a standalone version that doesn't require external dependencies
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sqlite3
import os
from datetime import datetime, timedelta
import random

class SynapseHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        # Mock API responses
        if path == '/api/triage/dashboard/summary':
            response = {
                "triage_status_counts": {
                    "assigned": 15,
                    "in_progress": 8,
                    "completed": 101,
                    "overdue": 3
                },
                "overdue_reviews": 3,
                "available_reviewers": 45,
                "grant_status_counts": {
                    "submitted": 23,
                    "under_review": 31,
                    "approved": 67,
                    "rejected": 3
                },
                "total_grants": 124,
                "total_reviewers": 58,
                "total_triage_records": 127
            }
        elif path == '/api/grants':
            response = [
                {
                    "id": 1,
                    "title": "Multiple Sclerosis Biomarker Discovery Using Machine Learning",
                    "principal_investigator": "Dr. Sarah Johnson",
                    "pi_email": "s.johnson@university.edu",
                    "pi_institution": "University Medical Center",
                    "budget_requested": 250000.0,
                    "duration_months": 24,
                    "status": "submitted",
                    "priority": "high",
                    "eligibility_score": 0.85,
                    "created_at": "2024-01-15T10:30:00Z",
                    "updated_at": "2024-01-15T10:30:00Z",
                    "upload_date": "2024-01-15T10:30:00Z",
                    "compliance_flags": []
                },
                {
                    "id": 2,
                    "title": "Novel Therapeutic Targets for Progressive MS",
                    "principal_investigator": "Dr. Michael Chen",
                    "pi_email": "m.chen@research.org",
                    "pi_institution": "Research Institute",
                    "budget_requested": 180000.0,
                    "duration_months": 18,
                    "status": "under_review",
                    "priority": "medium",
                    "eligibility_score": 0.92,
                    "created_at": "2024-01-10T14:20:00Z",
                    "updated_at": "2024-01-12T09:15:00Z",
                    "upload_date": "2024-01-10T14:20:00Z",
                    "compliance_flags": ["budget_high"]
                }
            ]
        elif path == '/api/reviewers':
            response = [
                {
                    "id": 1,
                    "name": "Dr. Lisa Wang",
                    "email": "l.wang@university.edu",
                    "institution": "Stanford University",
                    "research_areas": ["Multiple Sclerosis", "Neurodegeneration", "Immunology"],
                    "available": True,
                    "current_review_count": 2,
                    "max_reviews_per_cycle": 5,
                    "status": "active"
                },
                {
                    "id": 2,
                    "name": "Dr. Robert Martinez",
                    "email": "r.martinez@hospital.org",
                    "institution": "Medical Center",
                    "research_areas": ["Clinical Trials", "MS Treatment", "Neurology"],
                    "available": True,
                    "current_review_count": 1,
                    "max_reviews_per_cycle": 4,
                    "status": "active"
                }
            ]
        elif path.startswith('/api/'):
            response = {"message": "API endpoint not implemented", "path": path}
        else:
            # Serve static files or default response
            response = {"message": "Synapse Grant Triage System API", "version": "1.0.0"}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self.do_GET()  # For now, handle POST same as GET
    
    def do_PUT(self):
        self.do_GET()
    
    def do_DELETE(self):
        self.do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('localhost', port), SynapseHandler)
    print(f"Synapse Test Server running on http://localhost:{port}")
    print("API endpoints available at http://localhost:{port}/api/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()