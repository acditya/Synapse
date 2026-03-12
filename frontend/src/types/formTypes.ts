export interface FormData {
  // Applicant Information
  fullName: string
  email: string
  affiliation: string
  orcid: string
  hasPhD: boolean
  hasMD: boolean
  scopusUrl?: string
  researcherImage?: string
  
  // Research Profile
  scopusId: string
  googleScholarUrl: string
  previousSubmissions: string
  additionalProfileInfo: string
  
  // Proposal Submission
  proposalFile: File | null
  proposalTitle: string
  abstract: string
  keywords: string
  
  // Funding & Ethics
  fundingAmount: string
  conflictOfInterest: string
  ethicsDocuments: File | null
  
  // AI-generated data
  aiSummary: string
  researchPriorities: string[]
  autoKeywords: string[]
  
  // AI Analysis responses
  aiResponses: Record<string, string>
}

export interface ValidationErrors {
  fullName?: string
  email?: string
  affiliation?: string
  qualifications?: string
  orcid?: string
  scopusId?: string
  googleScholarUrl?: string
  previousSubmissions?: string
  additionalProfileInfo?: string
  proposalFile?: string
  proposalTitle?: string
  abstract?: string
  keywords?: string
  fundingAmount?: string
  conflictOfInterest?: string
  ethicsDocuments?: string
  aiResponses?: string
}

export interface ResearchPriority {
  id: string
  name: string
  description: string
  color: string
}

export interface AIInsight {
  type: 'suggestion' | 'warning' | 'info'
  message: string
  confidence?: number
}

export interface PublicationData {
  title: string
  authors: string[]
  journal: string
  year: number
  citations: number
  doi?: string
}
