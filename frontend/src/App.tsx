import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import nmssLogo from '/National-MS-Society-1024x1024.avif'
import ApplicantDashboard from './pages/ApplicantDashboard'
import ApplicantPortal from './pages/ApplicantPortal'
import AdminDashboard from './pages/AdminDashboard'
import ReviewerDashboard from './pages/ReviewerDashboard'
import ReviewerAssigned from './pages/ReviewerAssigned'
import ReviewerReviewForm from './pages/ReviewerReviewForm'
import ReviewerCompleted from './pages/ReviewerCompleted'
import ReviewerProfile from './pages/ReviewerProfile'

function App() {
  return (
    <Router>
      <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/applicant" element={<ApplicantDashboard />} />
                <Route path="/applicant/new" element={<ApplicantPortal />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/reviewer" element={<ReviewerDashboard />} />
                <Route path="/reviewer/assigned" element={<ReviewerAssigned />} />
                <Route path="/reviewer/review/:id" element={<ReviewerReviewForm />} />
                <Route path="/reviewer/completed" element={<ReviewerCompleted />} />
                <Route path="/reviewer/profile" element={<ReviewerProfile />} />
      </Routes>
    </Router>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-[#05585F] text-2xl font-bold">Synapse</span>
              </div>
              <nav className="flex items-center space-x-6">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sign In</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sign Up</a>
                <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Products</span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Headline */}
            <div>
              <div className="flex items-center justify-center mb-6">
                <img src={nmssLogo} alt="NMSS Logo" className="h-128 w-128 mr-6" />
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  AI-Powered Support that will{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    streamline
                  </span>{' '}
                  your grant reviews
                </h1>
              </div>
            </div>

          </div>
        </main>

        {/* Meet Synapse Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#202538] mb-6">Meet Synapse</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Synapse revolutionizes grant review processes for the National Multiple Sclerosis Society, 
                bringing AI-powered efficiency and consistency to every application evaluation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#05585F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#202538] mb-3">Lightning Fast</h3>
                <p className="text-gray-600">Reduce review time by 70% with AI-powered analysis and automated scoring</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00A29D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#202538] mb-3">Consistent Quality</h3>
                <p className="text-gray-600">Ensure fair, standardized evaluations across all grant applications</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#05585F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#202538] mb-3">Secure & Compliant</h3>
                <p className="text-gray-600">Built with enterprise-grade security and full audit trail capabilities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#202538] mb-6">Powerful Capabilities</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Synapse leverages cutting-edge AI to transform how NMSS evaluates grant applications
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-[#202538] mb-6">AI-Powered Analysis</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#05585F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538] mb-2">Intelligent Document Processing</h4>
                      <p className="text-gray-600">Automatically extract and analyze key information from complex grant proposals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#00A29D] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538] mb-2">Smart Scoring System</h4>
                      <p className="text-gray-600">Consistent evaluation criteria with AI-assisted scoring and recommendations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#05585F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538] mb-2">Real-time Collaboration</h4>
                      <p className="text-gray-600">Seamless workflow for reviewers, administrators, and applicants</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#05585F] to-[#00A29D] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-[#202538] mb-4">Advanced AI Engine</h4>
                  <p className="text-gray-600 mb-6">
                    Built on state-of-the-art language models trained specifically for scientific grant evaluation
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#05585F]">99.9%</div>
                      <div className="text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#00A29D]">70%</div>
                      <div className="text-gray-600">Time Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Synapse Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#202538] mb-6">Why Choose Synapse?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join the future of grant review with a platform designed specifically for NMSS
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-3xl font-bold text-[#202538] mb-6">Measurable Impact</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538]">Faster Reviews</h4>
                      <p className="text-gray-600">Complete evaluations in days, not weeks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538]">Better Decisions</h4>
                      <p className="text-gray-600">Data-driven insights for optimal funding allocation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#202538]">Enhanced Security</h4>
                      <p className="text-gray-600">Enterprise-grade protection for sensitive research data</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-[#202538] mb-6 text-center">Review Process Efficiency</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Traditional Process</span>
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">With Synapse</span>
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-[#05585F] h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Average completion rate improvement
                </p>
              </div>
            </div>
            
            {/* Guardrails Section */}
            <div className="bg-[#F8F7F3] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#202538] mb-6 text-center">Built-in Guardrails</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#05585F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-[#202538] mb-2">Bias Prevention</h4>
                  <p className="text-gray-600 text-sm">Advanced algorithms detect and prevent unconscious bias in evaluations</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#00A29D] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-[#202538] mb-2">Compliance Tracking</h4>
                  <p className="text-gray-600 text-sm">Full audit trail and compliance monitoring for regulatory requirements</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#05585F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-[#202538] mb-2">Data Security</h4>
                  <p className="text-gray-600 text-sm">End-to-end encryption and secure data handling protocols</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Access */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Access Your Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                to="/applicant"
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 block"
              >
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Applicant Dashboard</h3>
                <p className="text-gray-600 text-sm">Track applications and status</p>
              </Link>
              
              <Link 
                to="/applicant/new"
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 block"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">New Application</h3>
                <p className="text-gray-600 text-sm">Submit a new grant proposal</p>
              </Link>
              
              <Link 
                to="/admin"
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 block"
              >
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin</h3>
                <p className="text-gray-600 text-sm">Manage all applications and reviewers</p>
              </Link>
              
              <Link 
                to="/reviewer"
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 block"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewer</h3>
                <p className="text-gray-600 text-sm">Review assigned applications</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Ready to transform your grant review process?
              </h2>
              <p className="text-xl text-blue-200 mb-8">
                Experience Synapse firsthand for NMSS grant applications
              </p>
              <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center mx-auto">
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="border-t border-blue-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
                <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                  Trust & Security
                </a>
                <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                  Terms of Service
        </a>
      </div>
              <div className="text-blue-200 text-sm">
                © 2025 Synapse. Developed for the National Multiple Sclerosis Society. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
}

export default App