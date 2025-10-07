export interface Application {
  id: string
  applicantName: string
  proposalTitle: string
  researchArea: string
  aiRelevanceScore: number
  coiFlag: boolean
  status: 'pending' | 'under_review' | 'completed'
  submissionDate: string
  priority: 'high' | 'medium' | 'low'
  aiInsights: AIInsight
}

export interface ReviewerStats {
  totalAssigned: number
  pendingReviews: number
  aiFlaggedConflicts: number
  averageReviewTime: number
}

export interface AIInsight {
  summary: string
  conflicts: string[]
  priorityAlignment: string[]
  suggestedQuestions: string[]
}

export interface ReviewerProfile {
  name: string
  email: string
  affiliation: string
  expertise: string[]
  totalReviews: number
  averageRating: number
}

export interface ReviewDecision {
  applicationId: string
  decision: 'approve' | 'reject' | 'request_revision'
  ratings: {
    relevance: number
    feasibility: number
    innovation: number
    ethics: number
  }
  notes: string
  aiQuestions: string[]
  timestamp: string
}

export interface ConflictOfInterest {
  type: 'co_author' | 'institution' | 'funding' | 'personal'
  description: string
  severity: 'low' | 'medium' | 'high'
  resolved: boolean
}

export interface PriorityAlignment {
  category: string
  score: number
  description: string
}
