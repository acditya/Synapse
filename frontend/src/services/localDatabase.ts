// Local Database Service for NMSS Synapse
// This provides mock data and local storage for development

import type { ARLAssessment, BenchmarkScore, ExternalSignals, STBAnswer } from '../types/arlTypes'
import type { ScholarProfile, NewsProfile } from './scholarService'
import { scholarService } from './scholarService'

export interface Application {
  id: string
  title: string
  applicant: string
  institution: string
  department: string
  email: string
  status: 'Submitted' | 'Under Review' | 'Decision Pending' | 'Awarded' | 'Rejected'
  submittedDate: string
  dueDate: string
  budget: number
  duration: string
  abstract: string
  keywords: string[]
  documents: {
    proposal: string
    ethics: string
    coi: string
    cvs: string[]
    collaborationLetters: string[]
  }
  flags: {
    eligibility: string[]
    compliance: string[]
    conflicts: string[]
  }
  reviewers: {
    assigned: string[]
    completed: string[]
    conflicts: string[]
  }
  arlAssessment?: ARLAssessment
  benchmarkScore?: BenchmarkScore
  externalSignals?: ExternalSignals
  stbAnswers?: STBAnswer[]
  scholarProfile?: ScholarProfile
  newsProfile?: NewsProfile
}

export interface Reviewer {
  id: string
  name: string
  email: string
  institution: string
  expertise: string[]
  hIndex: number
  totalCitations: number
  last5yPubs: number
  topics: string[]
  conflicts: string[]
  availability: 'available' | 'busy' | 'unavailable'
  scholarProfile?: ScholarProfile
  newsProfile?: NewsProfile
  reputationScore: number
  msRelevance: number
}

class LocalDatabase {
  private applications: Application[] = []
  private reviewers: Reviewer[] = []
  private _currentUser: string = 'admin'

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // Initialize mock applications
    this.applications = [
      {
        id: 'APP-2024-001',
        title: 'Novel Biomarkers for MS Progression',
        applicant: 'Dr. Sarah Johnson',
        institution: 'University of California',
        department: 'Department of Neuroscience',
        email: 'sarah.johnson@uc.edu',
        status: 'Under Review',
        submittedDate: '2024-11-15',
        dueDate: '2024-12-15',
        budget: 250000,
        duration: '24 months',
        abstract: 'This study investigates novel biomarkers for multiple sclerosis progression using advanced neuroimaging techniques and machine learning approaches. The research aims to identify early indicators of disease progression that could lead to more effective treatment strategies.',
        keywords: ['multiple sclerosis', 'biomarkers', 'neuroimaging', 'machine learning'],
        documents: {
          proposal: 'proposal_2024_001.pdf',
          ethics: 'ethics_2024_001.pdf',
          coi: 'coi_2024_001.pdf',
          cvs: ['cv_sarah_johnson.pdf', 'cv_collaborator.pdf'],
          collaborationLetters: ['collab_letter_1.pdf']
        },
        flags: {
          eligibility: ['Missing IRB approval'],
          compliance: ['Budget exceeds indirect cost cap'],
          conflicts: []
        },
        reviewers: {
          assigned: ['REV-001', 'REV-002'],
          completed: [],
          conflicts: []
        }
      },
      {
        id: 'APP-2024-002',
        title: 'Clinical Trial for MS Treatment',
        applicant: 'Dr. Michael Chen',
        institution: 'Johns Hopkins University',
        department: 'Department of Neurology',
        email: 'michael.chen@jhu.edu',
        status: 'Awarded',
        submittedDate: '2024-10-20',
        dueDate: '2024-11-20',
        budget: 500000,
        duration: '36 months',
        abstract: 'A randomized controlled trial examining the efficacy of a new MS treatment protocol with focus on patient outcomes and safety measures. This study will enroll 200 patients across 5 sites.',
        keywords: ['clinical trial', 'MS treatment', 'randomized controlled trial', 'patient outcomes'],
        documents: {
          proposal: 'proposal_2024_002.pdf',
          ethics: 'ethics_2024_002.pdf',
          coi: 'coi_2024_002.pdf',
          cvs: ['cv_michael_chen.pdf'],
          collaborationLetters: ['collab_letter_2.pdf', 'collab_letter_3.pdf']
        },
        flags: {
          eligibility: [],
          compliance: [],
          conflicts: []
        },
        reviewers: {
          assigned: ['REV-001', 'REV-003', 'REV-004'],
          completed: ['REV-001', 'REV-003', 'REV-004'],
          conflicts: []
        }
      },
      {
        id: 'APP-2024-003',
        title: 'MS Rehabilitation Study',
        applicant: 'Dr. Lisa Rodriguez',
        institution: 'Stanford University',
        department: 'Department of Physical Medicine',
        email: 'lisa.rodriguez@stanford.edu',
        status: 'Under Review',
        submittedDate: '2024-11-10',
        dueDate: '2024-12-10',
        budget: 180000,
        duration: '18 months',
        abstract: 'Investigating the effectiveness of novel rehabilitation approaches for MS patients with mobility impairments. This study will use virtual reality and robotic assistance.',
        keywords: ['rehabilitation', 'mobility', 'virtual reality', 'robotic assistance'],
        documents: {
          proposal: 'proposal_2024_003.pdf',
          ethics: 'ethics_2024_003.pdf',
          coi: 'coi_2024_003.pdf',
          cvs: ['cv_lisa_rodriguez.pdf'],
          collaborationLetters: []
        },
        flags: {
          eligibility: [],
          compliance: ['Missing data management plan'],
          conflicts: []
        },
        reviewers: {
          assigned: ['REV-002', 'REV-005'],
          completed: [],
          conflicts: []
        }
      }
    ]

    // Initialize mock reviewers
    this.reviewers = [
      {
        id: 'REV-001',
        name: 'Dr. Emily Watson',
        email: 'emily.watson@harvard.edu',
        institution: 'Harvard Medical School',
        expertise: ['Multiple Sclerosis', 'Neuroimaging', 'Biomarkers'],
        hIndex: 45,
        totalCitations: 3200,
        last5yPubs: 12,
        topics: ['MS', 'neuroimaging', 'biomarkers', 'clinical trials'],
        conflicts: [],
        availability: 'available',
        reputationScore: 85,
        msRelevance: 90
      },
      {
        id: 'REV-002',
        name: 'Dr. James Wilson',
        email: 'james.wilson@mit.edu',
        institution: 'MIT',
        expertise: ['Machine Learning', 'Data Science', 'Biostatistics'],
        hIndex: 38,
        totalCitations: 2800,
        last5yPubs: 15,
        topics: ['machine learning', 'data science', 'biostatistics', 'AI'],
        conflicts: [],
        availability: 'available',
        reputationScore: 78,
        msRelevance: 65
      },
      {
        id: 'REV-003',
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@ucsf.edu',
        institution: 'UCSF',
        expertise: ['Clinical Trials', 'Patient Outcomes', 'Rehabilitation'],
        hIndex: 42,
        totalCitations: 2900,
        last5yPubs: 10,
        topics: ['clinical trials', 'patient outcomes', 'rehabilitation', 'MS'],
        conflicts: [],
        availability: 'available',
        reputationScore: 82,
        msRelevance: 88
      },
      {
        id: 'REV-004',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@yale.edu',
        institution: 'Yale University',
        expertise: ['Neurology', 'MS Research', 'Clinical Practice'],
        hIndex: 35,
        totalCitations: 2100,
        last5yPubs: 8,
        topics: ['neurology', 'MS research', 'clinical practice'],
        conflicts: [],
        availability: 'busy',
        reputationScore: 75,
        msRelevance: 92
      },
      {
        id: 'REV-005',
        name: 'Dr. Sarah Thompson',
        email: 'sarah.thompson@duke.edu',
        institution: 'Duke University',
        expertise: ['Physical Medicine', 'Rehabilitation', 'MS Care'],
        hIndex: 28,
        totalCitations: 1800,
        last5yPubs: 6,
        topics: ['physical medicine', 'rehabilitation', 'MS care'],
        conflicts: [],
        availability: 'available',
        reputationScore: 70,
        msRelevance: 85
      }
    ]
  }

  // Application methods
  getAllApplications(): Application[] {
    return this.applications
  }

  getApplicationById(id: string): Application | undefined {
    return this.applications.find(app => app.id === id)
  }

  createApplication(application: Omit<Application, 'id'>): Application {
    const newApplication: Application = {
      ...application,
      id: `APP-${Date.now()}`
    }
    this.applications.push(newApplication)
    return newApplication
  }

  updateApplication(id: string, updates: Partial<Application>): Application | null {
    const index = this.applications.findIndex(app => app.id === id)
    if (index === -1) return null
    
    this.applications[index] = { ...this.applications[index], ...updates }
    return this.applications[index]
  }

  deleteApplication(id: string): boolean {
    const index = this.applications.findIndex(app => app.id === id)
    if (index === -1) return false
    
    this.applications.splice(index, 1)
    return true
  }

  // Reviewer methods
  getAllReviewers(): Reviewer[] {
    return this.reviewers
  }

  getReviewerById(id: string): Reviewer | undefined {
    return this.reviewers.find(reviewer => reviewer.id === id)
  }

  // ARL Assessment methods
  getARLAssessment(applicationId: string): ARLAssessment | null {
    const application = this.getApplicationById(applicationId)
    return application?.arlAssessment || null
  }

  saveARLAssessment(applicationId: string, assessment: ARLAssessment): void {
    const application = this.getApplicationById(applicationId)
    if (application) {
      application.arlAssessment = assessment
    }
  }

  // Benchmark methods
  getBenchmarkScore(applicationId: string): BenchmarkScore | null {
    const application = this.getApplicationById(applicationId)
    return application?.benchmarkScore || null
  }

  saveBenchmarkScore(applicationId: string, score: BenchmarkScore): void {
    const application = this.getApplicationById(applicationId)
    if (application) {
      application.benchmarkScore = score
    }
  }

  // External signals methods
  getExternalSignals(applicationId: string): ExternalSignals | null {
    const application = this.getApplicationById(applicationId)
    return application?.externalSignals || null
  }

  saveExternalSignals(applicationId: string, signals: ExternalSignals): void {
    const application = this.getApplicationById(applicationId)
    if (application) {
      application.externalSignals = signals
    }
  }

  // STB Interview methods
  getSTBAnswers(applicationId: string): STBAnswer[] {
    const application = this.getApplicationById(applicationId)
    return application?.stbAnswers || []
  }

  saveSTBAnswers(applicationId: string, answers: STBAnswer[]): void {
    const application = this.getApplicationById(applicationId)
    if (application) {
      application.stbAnswers = answers
    }
  }

  // Scholar Profile methods
  async fetchScholarProfile(applicationId: string): Promise<ScholarProfile | null> {
    const application = this.getApplicationById(applicationId)
    if (!application) return null

    if (application.scholarProfile) {
      return application.scholarProfile
    }

    try {
      const profile = await scholarService.fetchScholarProfile(application.email)
      application.scholarProfile = profile
      return profile
    } catch (error) {
      console.error('Error fetching scholar profile:', error)
      return null
    }
  }

  async updateScholarProfile(applicationId: string, profile: ScholarProfile): Promise<void> {
    const application = this.getApplicationById(applicationId)
    if (application) {
      application.scholarProfile = profile
    }
  }

  // News Profile methods
  async fetchNewsProfile(applicationId: string): Promise<NewsProfile | null> {
    const application = this.getApplicationById(applicationId)
    if (!application) return null

    if (application.newsProfile) {
      return application.newsProfile
    }

    try {
      const profile = await scholarService.fetchNewsProfile(application.applicant)
      application.newsProfile = profile
      return profile
    } catch (error) {
      console.error('Error fetching news profile:', error)
      return null
    }
  }

  // Reviewer Profile methods
  async fetchReviewerProfile(reviewerId: string): Promise<ScholarProfile | null> {
    const reviewer = this.getReviewerById(reviewerId)
    if (!reviewer) return null

    if (reviewer.scholarProfile) {
      return reviewer.scholarProfile
    }

    try {
      const profile = await scholarService.fetchScholarProfile(reviewer.email)
      reviewer.scholarProfile = profile
      reviewer.reputationScore = scholarService.calculateReputationScore(profile)
      reviewer.msRelevance = profile.msRelevance
      return profile
    } catch (error) {
      console.error('Error fetching reviewer profile:', error)
      return null
    }
  }

  // Enhanced reviewer matching with scholar profiles
  async getRecommendedReviewers(applicationId: string): Promise<Reviewer[]> {
    const application = this.getApplicationById(applicationId)
    if (!application) return []

    // Fetch application's scholar profile
    const appProfile = await this.fetchScholarProfile(applicationId)
    if (!appProfile) return []

    // Get all reviewers with their profiles
    const reviewers = this.getAllReviewers()
    const reviewersWithProfiles = await Promise.all(
      reviewers.map(async (reviewer) => {
        const profile = await this.fetchReviewerProfile(reviewer.id)
        return { ...reviewer, scholarProfile: profile }
      })
    )

    // Calculate match scores
    const scoredReviewers = reviewersWithProfiles.map(reviewer => {
      const matchScore = this.calculateReviewerMatchScore(appProfile, reviewer)
      return { ...reviewer, matchScore }
    })

    // Sort by match score and return top 5
    return scoredReviewers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  }

  // Calculate reviewer match score
  private calculateReviewerMatchScore(appProfile: ScholarProfile, reviewer: Reviewer): number {
    let score = 0

    // Topic overlap (40% weight)
    const appTopics = appProfile.topics
    const reviewerTopics = reviewer.topics
    const topicOverlap = appTopics.filter(topic => 
      reviewerTopics.some(rt => rt.toLowerCase().includes(topic.toLowerCase()))
    ).length
    score += (topicOverlap / Math.max(appTopics.length, 1)) * 40

    // MS relevance match (30% weight)
    const msRelevanceMatch = 100 - Math.abs(appProfile.msRelevance - reviewer.msRelevance)
    score += (msRelevanceMatch / 100) * 30

    // Reputation score (20% weight)
    score += (reviewer.reputationScore / 100) * 20

    // Availability (10% weight)
    const availabilityScore = reviewer.availability === 'available' ? 100 : 
                            reviewer.availability === 'busy' ? 50 : 0
    score += (availabilityScore / 100) * 10

    return Math.min(score, 100)
  }

  // Statistics methods
  getApplicationStats() {
    const total = this.applications.length
    const underReview = this.applications.filter(app => app.status === 'Under Review').length
    const awarded = this.applications.filter(app => app.status === 'Awarded').length
    const rejected = this.applications.filter(app => app.status === 'Rejected').length
    
    return {
      total,
      underReview,
      awarded,
      rejected,
      pending: total - underReview - awarded - rejected
    }
  }

  getReviewerStats() {
    const total = this.reviewers.length
    const available = this.reviewers.filter(rev => rev.availability === 'available').length
    const busy = this.reviewers.filter(rev => rev.availability === 'busy').length
    
    return {
      total,
      available,
      busy,
      unavailable: total - available - busy
    }
  }

  // Search methods
  searchApplications(query: string): Application[] {
    const lowercaseQuery = query.toLowerCase()
    return this.applications.filter(app => 
      app.title.toLowerCase().includes(lowercaseQuery) ||
      app.applicant.toLowerCase().includes(lowercaseQuery) ||
      app.institution.toLowerCase().includes(lowercaseQuery) ||
      app.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    )
  }

  searchReviewers(query: string): Reviewer[] {
    const lowercaseQuery = query.toLowerCase()
    return this.reviewers.filter(reviewer => 
      reviewer.name.toLowerCase().includes(lowercaseQuery) ||
      reviewer.institution.toLowerCase().includes(lowercaseQuery) ||
      reviewer.expertise.some(exp => exp.toLowerCase().includes(lowercaseQuery)) ||
      reviewer.topics.some(topic => topic.toLowerCase().includes(lowercaseQuery))
    )
  }
}

// Export singleton instance
export const localDatabase = new LocalDatabase()
