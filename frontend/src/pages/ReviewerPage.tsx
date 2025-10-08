import { useState, useEffect } from 'react'
import ReviewerHeader from '../components/reviewer/ReviewerHeader'
import DashboardOverview from '../components/reviewer/DashboardOverview'
import ApplicationsTable from '../components/reviewer/ApplicationsTable'
import ProposalDetailView from '../components/reviewer/ProposalDetailView'
import { hardcodedApplications, type ApplicationData } from '../data/hardcodedApplications'
import type { Application, ReviewerStats } from '../types/reviewerTypes'

const ReviewerPage = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewerStats, setReviewerStats] = useState<ReviewerStats>({
    totalAssigned: 0,
    pendingReviews: 0,
    aiFlaggedConflicts: 0,
    averageReviewTime: 0
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load hardcoded applications data
  useEffect(() => {
    const loadReviewerData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate reviewer stats from hardcoded data
      const totalAssigned = hardcodedApplications.length
      const pendingReviews = hardcodedApplications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
      const aiFlaggedConflicts = hardcodedApplications.filter(app => app.complianceStatus.irbApproved === false).length
      const averageReviewTime = 2.5
      
      setReviewerStats({
        totalAssigned,
        pendingReviews,
        aiFlaggedConflicts,
        averageReviewTime
      })
      
      // Convert hardcoded applications to reviewer format
      const reviewerApplications: Application[] = hardcodedApplications.map(app => ({
        id: app.id,
        applicantName: app.fullName,
        proposalTitle: app.proposalTitle,
        researchArea: app.researchPriorities.join(', '),
        aiRelevanceScore: app.reviewScore || 0,
        coiFlag: app.conflictOfInterest.includes('conflicts') ? false : true,
        status: app.status === 'under_review' ? 'pending' : app.status,
        submissionDate: app.submissionDate,
        priority: app.priority,
        aiInsights: {
          summary: app.aiSummary,
          conflicts: app.conflictOfInterest.includes('conflicts') ? ['No conflicts identified'] : [],
          priorityAlignment: app.researchPriorities,
          strengths: app.reviewerComments || [],
          concerns: app.riskAssessment.factors,
          suggestedQuestions: [
            'How will you ensure diverse participant representation?',
            'What is your timeline for clinical translation?',
            'How will you address potential confounding factors?'
          ]
        }
      }))
      
      setApplications(reviewerApplications)
      setIsLoading(false)
    }
    
    loadReviewerData()
  }, [])

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application)
  }

  const handleCloseDetailView = () => {
    setSelectedApplication(null)
  }

  const handleReviewUpdate = (applicationId: string, updates: Partial<Application>) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, ...updates }
          : app
      )
    )
    
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  if (isLoading) {
    return (
      <div className="reviewer-page">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading reviewer dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reviewer-page">
      <ReviewerHeader />
      
      <div className="reviewer-container">
        <DashboardOverview stats={reviewerStats} />
        
        <div className="reviewer-main-content">
          <ApplicationsTable 
            applications={applications}
            onApplicationSelect={handleApplicationSelect}
            selectedApplicationId={selectedApplication?.id}
          />
          
          {selectedApplication && (
            <ProposalDetailView
              application={selectedApplication}
              onClose={handleCloseDetailView}
              onReviewUpdate={handleReviewUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewerPage
