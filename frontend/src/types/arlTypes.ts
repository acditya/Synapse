// ARL (Application Readiness Level) Type Definitions
// Based on NASA's Technology Readiness Level adapted for applications

export interface ARLMilestone {
  level: number
  code: string
  title: string
  description: string
  acceptanceCriteria: string[]
  evidencePatterns: string[]
  actionTemplate: string
  required: boolean
}

export interface ARLAssessment {
  id: string
  applicationId: string
  startARL: number
  goalARL: number
  currentARL: number
  confidence: number
  rationale: string
  milestones: ARLMilestoneStatus[]
  createdAt: Date
  updatedAt: Date
}

export interface ARLMilestoneStatus {
  milestoneCode: string
  met: boolean
  evidenceDoc?: string
  quoteText?: string
  notes?: string
  confidence: number
}

export interface STBQuestion {
  id: string
  question: string
  maxWords: number
  schema: {
    fields: string[]
    required: string[]
  }
  evidenceMapping: string
  arlLevel: number
}

export interface STBAnswer {
  questionId: string
  answer: string
  normalizedAnswer: Record<string, any>
  evidenceLinks: EvidenceLink[]
  gaps: string[]
  confidence: number
}

export interface EvidenceLink {
  documentId: string
  slideNumber: number
  textBlock: string
  boundingBox?: Coordinates
  confidence: number
  milestoneMatches: string[]
}

export interface Coordinates {
  x: number
  y: number
  width: number
  height: number
}

export interface BenchmarkDimensions {
  feasibility: {
    methodsAdequacy: number
    resources: number
    timelineRealism: number
    sampleSize: number
    riskMitigation: number
  }
  novelty: {
    topicFrontier: number
    msRelevance: number
    citationQuality: number
  }
  reproducibility: {
    protocolDetail: number
    dataCodePlan: number
    preregistration: number
  }
  budgetRealism: {
    disallowedItems: number
    indirectCaps: number
    unitCosts: number
    contingency: number
  }
  ethics: {
    humanSubjects: number
    mohapCompliance: number
    dataPrivacy: number
    vulnerablePopulations: number
  }
  reviewerFit: {
    matchQuality: number
    conflictCleanliness: number
  }
}

export interface BenchmarkScore {
  applicationId: string
  dimensions: BenchmarkDimensions
  compositeScore: number
  percentile: number
  notes: string[]
  recommendations: string[]
  createdAt: Date
}

export interface ExternalSignals {
  academicProfile: {
    hIndex: number
    totalCitations: number
    last5yPubs: number
    topics: string[]
    reputationScore: number
  }
  newsProfile: {
    mentions: number
    controversies: string[]
    riskFlags: string[]
  }
  disclaimer: string
  rebuttalNote?: string
}

export interface ARLReviewerMatch {
  reviewerId: string
  name: string
  expertiseLevel: number
  arlExperience: number[]
  conflictStatus: 'clean' | 'minor' | 'major'
  rationale: string
  matchScore: number
  topics: string[]
}

export interface ARLAction {
  id: string
  milestoneCode: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionType: 'upload' | 'clarify' | 'provide' | 'complete'
  suggestedDocuments: string[]
  deadline?: Date
}

export interface ARLProgress {
  currentARL: number
  goalARL: number
  gap: number
  milestonesMet: number
  milestonesTotal: number
  completionPercentage: number
  nextMilestones: ARLMilestone[]
  criticalActions: ARLAction[]
}