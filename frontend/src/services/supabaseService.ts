// Supabase Service for NMSS Synapse
// Comprehensive database integration with Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types for Supabase integration
export interface Application {
  id: string
  user_id: string
  title: string
  abstract?: string
  keywords: string[]
  budget?: number
  duration?: string
  status: 'draft' | 'submitted' | 'under_review' | 'decision_pending' | 'awarded' | 'rejected'
  submitted_date?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface ScholarProfile {
  id: string
  user_id: string
  h_index: number
  total_citations: number
  last_5y_pubs: number
  reputation_score: number
  ms_relevance: number
  expertise: string[]
  topics: string[]
  collaboration_network: string[]
  last_updated: string
  created_at: string
}

export interface Publication {
  id: string
  scholar_profile_id: string
  title: string
  authors: string[]
  year?: number
  journal?: string
  citations: number
  abstract?: string
  keywords: string[]
  ms_relevance: number
  impact_factor?: number
  created_at: string
}

export interface Reviewer {
  id: string
  user_id: string
  expertise: string[]
  topics: string[]
  availability: 'available' | 'busy' | 'unavailable'
  reputation_score: number
  ms_relevance: number
  created_at: string
  updated_at: string
}

export interface ARLAssessment {
  id: string
  application_id: string
  start_arl?: string
  goal_arl?: string
  current_arl?: string
  confidence: number
  rationale?: string
  created_at: string
  updated_at: string
}

export interface ARLMilestone {
  id: string
  arl_assessment_id: string
  level: string
  milestone_code: string
  met: boolean
  evidence_doc?: string
  evidence_quote?: string
  evidence_span?: any
  notes?: string
  created_at: string
}

export interface BenchmarkScore {
  id: string
  application_id: string
  feasibility: number
  novelty: number
  reproducibility: number
  budget_realism: number
  ethics: number
  reviewer_fit: number
  composite_score: number
  notes?: any
  created_at: string
  updated_at: string
}

export interface ExternalSignals {
  id: string
  application_id: string
  h_index: number
  total_citations: number
  last_5y_pubs: number
  topics: string[]
  news_mentions: number
  risk_flags: string[]
  reputation_score: number
  rationale?: string
  rebuttal_note?: string
  created_at: string
  updated_at: string
}

export interface ReviewerAssignment {
  id: string
  application_id: string
  reviewer_id: string
  assigned_by?: string
  match_score: number
  match_reasons: string[]
  status: 'assigned' | 'accepted' | 'declined' | 'completed'
  assigned_at: string
  completed_at?: string
}

export interface NewsProfile {
  id: string
  user_id: string
  mentions: number
  controversies: string[]
  risk_flags: string[]
  media_sentiment: 'positive' | 'neutral' | 'negative'
  last_updated: string
  created_at: string
}

export interface NewsItem {
  id: string
  news_profile_id: string
  title: string
  source?: string
  date?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  url?: string
  created_at: string
}

export interface STBAnswer {
  id: string
  application_id: string
  question_id: number
  question_text: string
  answer_text: string
  normalized_answer?: any
  evidence_links?: any
  confidence: number
  created_at: string
}

export interface ApplicationDocument {
  id: string
  application_id: string
  document_type: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  uploaded_at: string
}

export interface ApplicationFlag {
  id: string
  application_id: string
  flag_type: string
  flag_message: string
  severity: string
  resolved: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  institution?: string
  department?: string
  role: string
  created_at: string
  updated_at: string
}

class SupabaseService {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'
    
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // User management methods
  async createUser(user: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async createReviewer(reviewer: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('reviewers')
      .insert(reviewer)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async signUp(email: string, password: string, metadata: any = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getApplicationById(id: string): Promise<Application | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .insert(application)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteApplication(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Scholar Profile methods
  async getScholarProfile(userId: string): Promise<ScholarProfile | null> {
    const { data, error } = await this.supabase
      .from('scholar_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async createScholarProfile(profile: Omit<ScholarProfile, 'id' | 'created_at' | 'last_updated'>): Promise<ScholarProfile> {
    const { data, error } = await this.supabase
      .from('scholar_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateScholarProfile(userId: string, updates: Partial<ScholarProfile>): Promise<ScholarProfile> {
    const { data, error } = await this.supabase
      .from('scholar_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Publication methods
  async getPublications(scholarProfileId: string): Promise<Publication[]> {
    const { data, error } = await this.supabase
      .from('publications')
      .select('*')
      .eq('scholar_profile_id', scholarProfileId)
      .order('year', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createPublication(publication: Omit<Publication, 'id' | 'created_at'>): Promise<Publication> {
    const { data, error } = await this.supabase
      .from('publications')
      .insert(publication)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Reviewer methods
  async getReviewers(): Promise<Reviewer[]> {
    const { data, error } = await this.supabase
      .from('reviewers')
      .select('*')
      .order('reputation_score', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getReviewerById(id: string): Promise<Reviewer | null> {
    const { data, error } = await this.supabase
      .from('reviewers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getRecommendedReviewers(applicationId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_recommended_reviewers', { app_id: applicationId })

    if (error) throw error
    return data || []
  }

  // ARL Assessment methods
  async getARLAssessment(applicationId: string): Promise<ARLAssessment | null> {
    const { data, error } = await this.supabase
      .from('arl_assessments')
      .select('*')
      .eq('application_id', applicationId)
      .single()

    if (error) throw error
    return data
  }

  async createARLAssessment(assessment: Omit<ARLAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<ARLAssessment> {
    const { data, error } = await this.supabase
      .from('arl_assessments')
      .insert(assessment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateARLAssessment(applicationId: string, updates: Partial<ARLAssessment>): Promise<ARLAssessment> {
    const { data, error } = await this.supabase
      .from('arl_assessments')
      .update(updates)
      .eq('application_id', applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ARL Milestone methods
  async getARLMilestones(assessmentId: string): Promise<ARLMilestone[]> {
    const { data, error } = await this.supabase
      .from('arl_milestones')
      .select('*')
      .eq('arl_assessment_id', assessmentId)
      .order('level', { ascending: true })

    if (error) throw error
    return data || []
  }

  async updateARLMilestone(id: string, updates: Partial<ARLMilestone>): Promise<ARLMilestone> {
    const { data, error } = await this.supabase
      .from('arl_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Benchmark Score methods
  async getBenchmarkScore(applicationId: string): Promise<BenchmarkScore | null> {
    const { data, error } = await this.supabase
      .from('benchmark_scores')
      .select('*')
      .eq('application_id', applicationId)
      .single()

    if (error) throw error
    return data
  }

  async createBenchmarkScore(score: Omit<BenchmarkScore, 'id' | 'created_at' | 'updated_at'>): Promise<BenchmarkScore> {
    const { data, error } = await this.supabase
      .from('benchmark_scores')
      .insert(score)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateBenchmarkScore(applicationId: string, updates: Partial<BenchmarkScore>): Promise<BenchmarkScore> {
    const { data, error } = await this.supabase
      .from('benchmark_scores')
      .update(updates)
      .eq('application_id', applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // External Signals methods
  async getExternalSignals(applicationId: string): Promise<ExternalSignals | null> {
    const { data, error } = await this.supabase
      .from('external_signals')
      .select('*')
      .eq('application_id', applicationId)
      .single()

    if (error) throw error
    return data
  }

  async createExternalSignals(signals: Omit<ExternalSignals, 'id' | 'created_at' | 'updated_at'>): Promise<ExternalSignals> {
    const { data, error } = await this.supabase
      .from('external_signals')
      .insert(signals)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateExternalSignals(applicationId: string, updates: Partial<ExternalSignals>): Promise<ExternalSignals> {
    const { data, error } = await this.supabase
      .from('external_signals')
      .update(updates)
      .eq('application_id', applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // STB Answer methods
  async getSTBAnswers(applicationId: string): Promise<STBAnswer[]> {
    const { data, error } = await this.supabase
      .from('stb_answers')
      .select('*')
      .eq('application_id', applicationId)
      .order('question_id', { ascending: true })

    if (error) throw error
    return data || []
  }

  async saveSTBAnswers(applicationId: string, answers: Omit<STBAnswer, 'id' | 'created_at'>[]): Promise<STBAnswer[]> {
    // Delete existing answers first
    await this.supabase
      .from('stb_answers')
      .delete()
      .eq('application_id', applicationId)

    // Insert new answers
    const { data, error } = await this.supabase
      .from('stb_answers')
      .insert(answers)
      .select()

    if (error) throw error
    return data || []
  }

  // News Profile methods
  async getNewsProfile(userId: string): Promise<NewsProfile | null> {
    const { data, error } = await this.supabase
      .from('news_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async createNewsProfile(profile: Omit<NewsProfile, 'id' | 'created_at' | 'last_updated'>): Promise<NewsProfile> {
    const { data, error } = await this.supabase
      .from('news_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Document methods
  async getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
    const { data, error } = await this.supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async uploadDocument(document: Omit<ApplicationDocument, 'id' | 'uploaded_at'>): Promise<ApplicationDocument> {
    const { data, error } = await this.supabase
      .from('application_documents')
      .insert(document)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Flag methods
  async getApplicationFlags(applicationId: string): Promise<ApplicationFlag[]> {
    const { data, error } = await this.supabase
      .from('application_flags')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createApplicationFlag(flag: Omit<ApplicationFlag, 'id' | 'created_at'>): Promise<ApplicationFlag> {
    const { data, error } = await this.supabase
      .from('application_flags')
      .insert(flag)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Statistics methods
  async getApplicationStats(): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_application_stats')

    if (error) throw error
    return data?.[0] || {}
  }

  async getReviewerStats(): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_reviewer_stats')

    if (error) throw error
    return data?.[0] || {}
  }

  // Search methods
  async searchApplications(query: string): Promise<Application[]> {
    const { data, error } = await this.supabase
      .rpc('search_applications', { search_query: query })

    if (error) throw error
    return data || []
  }

  async searchReviewers(query: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('search_reviewers', { search_query: query })

    if (error) throw error
    return data || []
  }

  // Reviewer Assignment methods
  async getReviewerAssignments(applicationId: string): Promise<ReviewerAssignment[]> {
    const { data, error } = await this.supabase
      .from('reviewer_assignments')
      .select('*')
      .eq('application_id', applicationId)

    if (error) throw error
    return data || []
  }

  async assignReviewer(assignment: Omit<ReviewerAssignment, 'id' | 'assigned_at'>): Promise<ReviewerAssignment> {
    const { data, error } = await this.supabase
      .from('reviewer_assignments')
      .insert(assignment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateReviewerAssignment(id: string, updates: Partial<ReviewerAssignment>): Promise<ReviewerAssignment> {
    const { data, error } = await this.supabase
      .from('reviewer_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Audit log methods
  async logAuditEvent(
    action: string,
    targetType: string,
    targetId: string,
    beforeData?: any,
    afterData?: any
  ): Promise<void> {
    const user = await this.getCurrentUser()
    
    const { error } = await this.supabase
      .from('audit_log')
      .insert({
        actor_id: user?.id,
        action,
        target_type: targetType,
        target_id: targetId,
        before_data: beforeData,
        after_data: afterData
      })

    if (error) throw error
  }

  // Real-time subscriptions
  subscribeToApplications(callback: (payload: any) => void) {
    return this.supabase
      .channel('applications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'applications' }, 
        callback
      )
      .subscribe()
  }

  subscribeToARLAssessments(callback: (payload: any) => void) {
    return this.supabase
      .channel('arl_assessments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'arl_assessments' }, 
        callback
      )
      .subscribe()
  }

  subscribeToReviewerAssignments(callback: (payload: any) => void) {
    return this.supabase
      .channel('reviewer_assignments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reviewer_assignments' }, 
        callback
      )
      .subscribe()
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()
export default supabaseService
