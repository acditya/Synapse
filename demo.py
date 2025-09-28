#!/usr/bin/env python3
"""
Synapse Grant Triage System Demo Script
Demonstrates key functionality of the AI-powered grant triage system
"""

import requests
import json
import time
from datetime import datetime

class SynapseDemo:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_connection(self):
        """Test if the server is running"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Server is running")
                return True
            else:
                print(f"❌ Server returned status {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to server. Make sure the server is running on", self.base_url)
            return False

    def test_dashboard_api(self):
        """Test dashboard summary API"""
        print("\n📊 Testing Dashboard API...")
        try:
            response = self.session.get(f"{self.base_url}/api/triage/dashboard/summary")
            if response.status_code == 200:
                data = response.json()
                print("✅ Dashboard API working")
                print(f"   - Total grants: {data.get('total_grants', 'N/A')}")
                print(f"   - Available reviewers: {data.get('available_reviewers', 'N/A')}")
                print(f"   - Overdue reviews: {data.get('overdue_reviews', 'N/A')}")
                return True
            else:
                print(f"❌ Dashboard API failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Dashboard API error: {e}")
            return False

    def test_grants_api(self):
        """Test grants API"""
        print("\n📄 Testing Grants API...")
        try:
            response = self.session.get(f"{self.base_url}/api/grants")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Grants API working - Found {len(data)} grants")
                if data:
                    grant = data[0]
                    print(f"   - Sample grant: '{grant.get('title', 'N/A')}'")
                    print(f"   - PI: {grant.get('principal_investigator', 'N/A')}")
                    print(f"   - Budget: ${grant.get('budget_requested', 0):,.2f}")
                return True
            else:
                print(f"❌ Grants API failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Grants API error: {e}")
            return False

    def test_reviewers_api(self):
        """Test reviewers API"""
        print("\n👥 Testing Reviewers API...")
        try:
            response = self.session.get(f"{self.base_url}/api/reviewers")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Reviewers API working - Found {len(data)} reviewers")
                if data:
                    reviewer = data[0]
                    print(f"   - Sample reviewer: {reviewer.get('name', 'N/A')}")
                    print(f"   - Institution: {reviewer.get('institution', 'N/A')}")
                    print(f"   - Available: {reviewer.get('available', 'N/A')}")
                return True
            else:
                print(f"❌ Reviewers API failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Reviewers API error: {e}")
            return False

    def test_performance(self):
        """Test API response times"""
        print("\n⚡ Testing API Performance...")
        endpoints = [
            "/api/triage/dashboard/summary",
            "/api/grants",
            "/api/reviewers"
        ]
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}")
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                if response.status_code == 200:
                    print(f"✅ {endpoint}: {response_time:.1f}ms")
                else:
                    print(f"❌ {endpoint}: {response.status_code} status")
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")

    def display_system_info(self):
        """Display system information"""
        print("\n🏗️ System Architecture:")
        print("   Backend: FastAPI + Python")
        print("   Frontend: React + TypeScript + Tailwind CSS")
        print("   Database: SQLite (development) / PostgreSQL (production)")
        print("   AI/ML: OpenAI API + LangChain + Sentence Transformers")
        print("   External APIs: ORCID + PubMed")
        
        print("\n🎯 Key Features:")
        features = [
            "📄 Automated PDF/DOCX document processing",
            "🤖 AI-powered grant analysis and summarization",
            "🔍 RAG-based policy compliance checking",
            "👥 Smart reviewer matching with embeddings",
            "⚖️ Conflict of interest detection",
            "📊 Real-time triage dashboard",
            "🛡️ Comprehensive compliance monitoring"
        ]
        
        for feature in features:
            print(f"   {feature}")

    def demonstrate_workflow(self):
        """Demonstrate the typical workflow"""
        print("\n🔄 Typical Grant Triage Workflow:")
        workflow_steps = [
            "1. 📤 Grant proposal uploaded (PDF/DOCX)",
            "2. 🔍 Document processing extracts metadata",
            "3. 🤖 AI analysis generates summary and eligibility score",
            "4. 🛡️ RAG system checks policy compliance",
            "5. 🎯 Embeddings created for reviewer matching",
            "6. 👥 Best reviewers identified using multi-factor algorithm",
            "7. ⚖️ COI screening performed automatically",
            "8. 📋 Assignment appears on triage board",
            "9. 👨‍💼 Reviewer receives notification and reviews",
            "10. ✅ Review completed and archived"
        ]
        
        for step in workflow_steps:
            print(f"   {step}")
            time.sleep(0.5)  # Dramatic effect

    def run_demo(self):
        """Run the complete demo"""
        print("🧬 SYNAPSE - AI-Powered Grant Triage System Demo")
        print("=" * 55)
        print(f"⏰ Demo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test server connection
        if not self.test_connection():
            print("\n❌ Demo cannot continue without server connection.")
            print("💡 To start the server, run: python test_server.py")
            return False
        
        # Test APIs
        dashboard_ok = self.test_dashboard_api()
        grants_ok = self.test_grants_api()
        reviewers_ok = self.test_reviewers_api()
        
        # Test performance
        self.test_performance()
        
        # Display system info
        self.display_system_info()
        
        # Demonstrate workflow
        self.demonstrate_workflow()
        
        # Summary
        print("\n📋 Demo Summary:")
        print(f"   Dashboard API: {'✅ Working' if dashboard_ok else '❌ Failed'}")
        print(f"   Grants API: {'✅ Working' if grants_ok else '❌ Failed'}")
        print(f"   Reviewers API: {'✅ Working' if reviewers_ok else '❌ Failed'}")
        
        all_working = dashboard_ok and grants_ok and reviewers_ok
        
        if all_working:
            print("\n🎉 All systems operational! The Synapse Grant Triage System is ready.")
            print("🌐 Frontend available at: http://localhost:3000")
            print("📚 API docs available at: http://localhost:8000/api/docs")
        else:
            print("\n⚠️ Some systems need attention. Check server logs for details.")
        
        print("\n" + "=" * 55)
        print("Thank you for trying Synapse! 🚀")
        
        return all_working

if __name__ == "__main__":
    demo = SynapseDemo()
    demo.run_demo()