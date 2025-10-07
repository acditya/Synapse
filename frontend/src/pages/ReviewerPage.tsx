import { useState, useEffect } from 'react'
import ReviewerHeader from '../components/reviewer/ReviewerHeader'
import DashboardOverview from '../components/reviewer/DashboardOverview'
import ApplicationsTable from '../components/reviewer/ApplicationsTable'
import ProposalDetailView from '../components/reviewer/ProposalDetailView'
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

  // Mock data initialization
  useEffect(() => {
    const loadReviewerData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock reviewer stats
      setReviewerStats({
        totalAssigned: 12,
        pendingReviews: 8,
        aiFlaggedConflicts: 3,
        averageReviewTime: 2.5
      })
      
      // Mock applications data
      const mockApplications: Application[] = [
        {
          id: 'APP-001',
          applicantName: 'Dr. Sarah Chen',
          proposalTitle: 'Neuroinflammation Biomarkers in Early MS Detection',
          researchArea: 'Biomarkers, Neuroinflammation, Early Detection',
          aiRelevanceScore: 87,
          coiFlag: false,
          status: 'pending',
          submissionDate: '2024-01-15',
          priority: 'high',
          aiInsights: {
            summary: 'Novel approach to identifying neuroinflammation biomarkers using advanced proteomics and machine learning algorithms.',
            conflicts: [],
            priorityAlignment: ['Neuroinflammation Research', 'Biomarker Development'],
            suggestedQuestions: [
              'How will you validate biomarker specificity for MS vs other neurological conditions?',
              'What is your timeline for clinical translation?'
            ]
          }
        },
        {
          id: 'APP-002',
          applicantName: 'Prof. Michael Rodriguez',
          proposalTitle: 'Microglial Activation Patterns in Progressive MS',
          researchArea: 'Microglia, Progressive MS, Neuroimaging',
          aiRelevanceScore: 92,
          coiFlag: true,
          status: 'under_review',
          submissionDate: '2024-01-12',
          priority: 'high',
          aiInsights: {
            summary: 'Comprehensive study of microglial activation using advanced neuroimaging and molecular techniques.',
            conflicts: ['Co-author relationship with previous NMSS grant recipient'],
            priorityAlignment: ['Neuroinflammation Research', 'Progressive MS'],
            suggestedQuestions: [
              'How will you address potential bias from co-author relationships?',
              'What controls will you implement for microglial activation studies?'
            ]
          }
        },
        {
          id: 'APP-003',
          applicantName: 'Dr. Emily Watson',
          proposalTitle: 'Patient-Reported Outcomes in MS Treatment',
          researchArea: 'Patient Outcomes, Quality of Life, Treatment',
          aiRelevanceScore: 78,
          coiFlag: false,
          status: 'pending',
          submissionDate: '2024-01-18',
          priority: 'medium',
          aiInsights: {
            summary: 'Longitudinal study examining patient-reported outcomes across different MS treatment modalities.',
            conflicts: [],
            priorityAlignment: ['Patient Care', 'Treatment Outcomes'],
            suggestedQuestions: [
              'How will you ensure diverse patient representation?',
              'What validated instruments will you use for outcome measurement?'
            ]
          }
        }
      ]
      
      setApplications(mockApplications)
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
