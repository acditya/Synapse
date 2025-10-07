import { useState } from 'react'
import type { Application } from '../../types/reviewerTypes'

interface ProposalDetailViewProps {
  application: Application
  onClose: () => void
  onReviewUpdate: (applicationId: string, updates: Partial<Application>) => void
}

const ProposalDetailView = ({ 
  application, 
  onClose, 
  onReviewUpdate 
}: ProposalDetailViewProps) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [ratings, setRatings] = useState({
    relevance: 0,
    feasibility: 0,
    innovation: 0,
    ethics: 0
  })
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const handleRatingChange = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleQuestionToggle = (question: string) => {
    setSelectedQuestions(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question)
        : [...prev, question]
    )
  }

  const handleSubmitReview = () => {
    // Update application status
    onReviewUpdate(application.id, {
      status: 'completed'
    })
    
    // Here you would typically save the review to the backend
    console.log('Review submitted:', {
      applicationId: application.id,
      ratings,
      notes: reviewerNotes,
      selectedQuestions
    })
    
    onClose()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ai-insights', label: 'AI Insights', icon: '🤖' },
    { id: 'conflicts', label: 'Conflicts', icon: '⚠️' },
    { id: 'review', label: 'Review', icon: '✍️' }
  ]

  return (
    <div className="proposal-detail-overlay">
      <div className="proposal-detail-drawer">
        <div className="detail-header">
          <div className="detail-title">
            <h2>{application.proposalTitle}</h2>
            <p>Application ID: {application.id}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="detail-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="applicant-info">
                <h3>Applicant Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{application.applicantName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Research Area:</span>
                    <span className="info-value">{application.researchArea}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Submission Date:</span>
                    <span className="info-value">
                      {new Date(application.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">AI Relevance Score:</span>
                    <span className="info-value score">
                      {application.aiRelevanceScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-summary">
                <h3>AI-Generated Summary</h3>
                <div className="summary-content">
                  {application.aiInsights.summary}
                </div>
              </div>

              <div className="priority-alignment">
                <h3>Research Priority Alignment</h3>
                <div className="alignment-badges">
                  {application.aiInsights.priorityAlignment.map((priority, index) => (
                    <span key={index} className="alignment-badge">
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="ai-insights-tab">
              <div className="ai-suggestions">
                <h3>AI-Suggested Review Questions</h3>
                <div className="questions-list">
                  {application.aiInsights.suggestedQuestions.map((question, index) => (
                    <div key={index} className="question-item">
                      <label className="question-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question)}
                          onChange={() => handleQuestionToggle(question)}
                        />
                        <span className="question-text">{question}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ai-analysis">
                <h3>AI Analysis Results</h3>
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <span className="analysis-label">Novelty Score:</span>
                    <span className="analysis-value">High</span>
                  </div>
                  <div className="analysis-item">
                    <span className="analysis-label">Methodology Quality:</span>
                    <span className="analysis-value">Strong</span>
                  </div>
                  <div className="analysis-item">
                    <span className="analysis-label">Clinical Relevance:</span>
                    <span className="analysis-value">Very High</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conflicts' && (
            <div className="conflicts-tab">
              <div className="conflict-detection">
                <h3>Conflict of Interest Detection</h3>
                {application.aiInsights.conflicts.length > 0 ? (
                  <div className="conflicts-list">
                    {application.aiInsights.conflicts.map((conflict, index) => (
                      <div key={index} className="conflict-item">
                        <span className="conflict-icon">⚠️</span>
                        <span className="conflict-text">{conflict}</span>
                        <button className="resolve-btn">Mark as Resolved</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-conflicts">
                    <span className="no-conflicts-icon">✅</span>
                    <p>No conflicts of interest detected</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="review-tab">
              <div className="rating-section">
                <h3>Review Ratings</h3>
                <div className="ratings-grid">
                  {Object.entries(ratings).map(([category, value]) => (
                    <div key={category} className="rating-item">
                      <label className="rating-label">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                      <div className="rating-control">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={value}
                          onChange={(e) => handleRatingChange(category, parseInt(e.target.value))}
                          className="rating-slider"
                        />
                        <span className="rating-value">{value}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="notes-section">
                <h3>Reviewer Notes</h3>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Enter your review notes here..."
                  className="notes-textarea"
                  rows={6}
                />
              </div>

              <div className="decision-section">
                <h3>Review Decision</h3>
                <div className="decision-buttons">
                  <button className="decision-btn approve">
                    Approve
                  </button>
                  <button className="decision-btn request-revision">
                    Request Revision
                  </button>
                  <button className="decision-btn reject">
                    Reject
                  </button>
                </div>
              </div>

              <div className="submit-section">
                <button 
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailView
