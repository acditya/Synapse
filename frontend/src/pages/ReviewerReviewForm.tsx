import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReviewerSidebar from '../components/ReviewerSidebar'

interface ReviewData {
  criteria: {
    significance: number
    feasibility: number
    innovation: number
    budgetJustification: number
  }
  comments: string
  recommendation: 'approve' | 'reject' | 'revise'
  isDraft: boolean
}

export default function ReviewerReviewForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('proposal')
  const [reviewData, setReviewData] = useState<ReviewData>({
    criteria: {
      significance: 0,
      feasibility: 0,
      innovation: 0,
      budgetJustification: 0
    },
    comments: '',
    recommendation: 'approve',
    isDraft: false
  })

  const application = {
    id: id,
    title: 'Novel Biomarkers for MS Progression',
    applicant: 'Dr. Maria Rodriguez',
    institution: 'University of California',
    submissionDate: '2024-11-15',
    dueDate: '2024-12-15',
    abstract: 'This study investigates novel biomarkers for multiple sclerosis progression using advanced neuroimaging techniques and machine learning approaches. The research aims to identify early indicators of disease progression that could lead to more effective treatment strategies.',
    budget: 250000,
    duration: '24 months'
  }

  const criteria = [
    { key: 'significance', label: 'Significance', description: 'How important is this research for MS field?' },
    { key: 'feasibility', label: 'Feasibility', description: 'How realistic are the proposed methods?' },
    { key: 'innovation', label: 'Innovation', description: 'How novel and creative is the approach?' },
    { key: 'budgetJustification', label: 'Budget Justification', description: 'How well justified is the budget request?' }
  ]

  const updateCriteria = (key: keyof ReviewData['criteria'], value: number) => {
    setReviewData(prev => ({
      ...prev,
      criteria: { ...prev.criteria, [key]: value }
    }))
  }

  const updateComments = (value: string) => {
    setReviewData(prev => ({ ...prev, comments: value }))
  }

  const updateRecommendation = (value: 'approve' | 'reject' | 'revise') => {
    setReviewData(prev => ({ ...prev, recommendation: value }))
  }

  const saveDraft = () => {
    setReviewData(prev => ({ ...prev, isDraft: true }))
    // Here you would save to backend
    console.log('Saving draft:', reviewData)
  }

  const submitReview = () => {
    setReviewData(prev => ({ ...prev, isDraft: false }))
    // Here you would submit to backend
    console.log('Submitting review:', reviewData)
    navigate('/reviewer/completed')
  }

  const getTotalScore = () => {
    const scores = Object.values(reviewData.criteria)
    return scores.reduce((sum, score) => sum + score, 0)
  }

  const getAverageScore = () => {
    const scores = Object.values(reviewData.criteria).filter(score => score > 0)
    return scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : 0
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <ReviewerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#202538]">{application.title}</h1>
                <p className="text-sm text-gray-600">{application.applicant} • {application.institution}</p>
              </div>
              <div className="text-sm text-gray-600">
                Due: {application.dueDate}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'proposal', label: 'Proposal PDF', icon: '📄' },
                  { id: 'scoring', label: 'Scoring Form', icon: '⭐' },
                  { id: 'comments', label: 'Comments', icon: '💬' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#05585F] text-[#05585F]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Proposal PDF Tab */}
              {activeTab === 'proposal' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#202538] mb-4">Application Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Budget:</span>
                        <span className="ml-2 text-gray-900">${application.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="ml-2 text-gray-900">{application.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submission Date:</span>
                        <span className="ml-2 text-gray-900">{application.submissionDate}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className="ml-2 text-gray-900">{application.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#202538] mb-4">Abstract</h3>
                    <p className="text-gray-700 leading-relaxed">{application.abstract}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📄 PDF Viewer</h4>
                    <p className="text-blue-800 text-sm mb-4">Click to view the full proposal PDF</p>
                    <button className="bg-[#05585F] text-white px-6 py-2 rounded-lg hover:bg-[#00A29D] transition-colors">
                      Open PDF Viewer
                    </button>
                  </div>
                </div>
              )}

              {/* Scoring Form Tab */}
              {activeTab === 'scoring' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-yellow-900 mb-2">🤖 AI Assistant</h4>
                    <p className="text-yellow-800 text-sm mb-3">Get AI-generated review suggestions based on the proposal content</p>
                    <button className="bg-[#FFCC66] text-[#202538] px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium">
                      Generate Review Draft
                    </button>
                  </div>

                  {criteria.map((criterion) => (
                    <div key={criterion.key} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#202538]">{criterion.label}</h3>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            onClick={() => updateCriteria(criterion.key as keyof ReviewData['criteria'], score)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              reviewData.criteria[criterion.key as keyof ReviewData['criteria']] === score
                                ? 'bg-[#05585F] text-white border-[#05585F]'
                                : 'border-gray-300 hover:bg-[#F8F7F3] hover:border-[#05585F]'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        {reviewData.criteria[criterion.key as keyof ReviewData['criteria']] > 0 && (
                          <span>Selected: {reviewData.criteria[criterion.key as keyof ReviewData['criteria']]}/5</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Overall Score */}
                  <div className="bg-[#F8F7F3] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#202538] mb-4">Overall Score</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Score</p>
                        <p className="text-2xl font-bold text-[#05585F]">{getTotalScore()}/20</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-[#05585F]">{getAverageScore()}/5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Recommendation</p>
                        <select
                          value={reviewData.recommendation}
                          onChange={(e) => updateRecommendation(e.target.value as 'approve' | 'reject' | 'revise')}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent"
                        >
                          <option value="approve">Approve</option>
                          <option value="revise">Revise & Resubmit</option>
                          <option value="reject">Reject</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#202538] mb-4">Review Comments</h3>
                    <textarea
                      value={reviewData.comments}
                      onChange={(e) => updateComments(e.target.value)}
                      rows={12}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent"
                      placeholder="Provide detailed comments about the proposal. Include strengths, weaknesses, and specific recommendations..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {reviewData.comments.length} characters
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Writing Tips</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Be specific and constructive in your feedback</li>
                      <li>• Highlight both strengths and areas for improvement</li>
                      <li>• Provide actionable recommendations</li>
                      <li>• Consider the proposal's feasibility and impact</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/reviewer/assigned')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Applications
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={saveDraft}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={submitReview}
                className="px-6 py-3 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
