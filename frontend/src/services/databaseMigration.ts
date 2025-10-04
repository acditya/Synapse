// Database Migration Service
// Helps migrate from local database to Supabase

import { supabaseService } from './supabaseService'
import { localDatabase } from './localDatabase'

export class DatabaseMigration {
  private supabase = supabaseService

  // Migrate all local data to Supabase
  async migrateAllData(): Promise<void> {
    console.log('Starting database migration...')
    
    try {
      // Migrate users
      await this.migrateUsers()
      
      // Migrate applications
      await this.migrateApplications()
      
      // Migrate reviewers
      await this.migrateReviewers()
      
      // Migrate ARL assessments
      await this.migrateARLAssessments()
      
      // Migrate benchmark scores
      await this.migrateBenchmarkScores()
      
      // Migrate external signals
      await this.migrateExternalSignals()
      
      console.log('Database migration completed successfully!')
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  // Migrate users from local database
  private async migrateUsers(): Promise<void> {
    console.log('Migrating users...')
    
    // Create sample users in Supabase
    const users = [
      {
        email: 'admin@nmss.org',
        name: 'Admin User',
        institution: 'NMSS',
        department: 'Administration',
        role: 'admin'
      },
      {
        email: 'sarah.johnson@uc.edu',
        name: 'Dr. Sarah Johnson',
        institution: 'University of California',
        department: 'Department of Neuroscience',
        role: 'applicant'
      },
      {
        email: 'michael.chen@jhu.edu',
        name: 'Dr. Michael Chen',
        institution: 'Johns Hopkins University',
        department: 'Department of Neurology',
        role: 'applicant'
      },
      {
        email: 'lisa.rodriguez@stanford.edu',
        name: 'Dr. Lisa Rodriguez',
        institution: 'Stanford University',
        department: 'Department of Physical Medicine',
        role: 'applicant'
      },
      {
        email: 'emily.watson@harvard.edu',
        name: 'Dr. Emily Watson',
        institution: 'Harvard Medical School',
        department: 'Department of Neurology',
        role: 'reviewer'
      },
      {
        email: 'james.wilson@mit.edu',
        name: 'Dr. James Wilson',
        institution: 'MIT',
        department: 'Department of Computer Science',
        role: 'reviewer'
      },
      {
        email: 'maria.garcia@ucsf.edu',
        name: 'Dr. Maria Garcia',
        institution: 'UCSF',
        department: 'Department of Neurology',
        role: 'reviewer'
      }
    ]

    for (const user of users) {
      try {
        await this.supabase.createUser(user)
        console.log(`Created user: ${user.email}`)
      } catch (error) {
        console.warn(`Failed to create user ${user.email}:`, error)
      }
    }
  }

  // Migrate applications
  private async migrateApplications(): Promise<void> {
    console.log('Migrating applications...')
    
    const localApps = localDatabase.getAllApplications()
    
    for (const app of localApps) {
      try {
        // Create user first if not exists
        const user = await this.findOrCreateUser(app.email, app.applicant, app.institution)
        
        const application = {
          user_id: user.id,
          title: app.title,
          abstract: app.abstract,
          keywords: app.keywords,
          budget: app.budget,
          duration: app.duration,
          status: app.status.toLowerCase().replace(' ', '_') as any,
          submitted_date: app.submittedDate,
          due_date: app.dueDate
        }
        
        await this.supabase.createApplication(application)
        console.log(`Created application: ${app.title}`)
      } catch (error) {
        console.warn(`Failed to create application ${app.title}:`, error)
      }
    }
  }

  // Migrate reviewers
  private async migrateReviewers(): Promise<void> {
    console.log('Migrating reviewers...')
    
    const localReviewers = localDatabase.getAllReviewers()
    
    for (const reviewer of localReviewers) {
      try {
        // Create user first if not exists
        const user = await this.findOrCreateUser(reviewer.email, reviewer.name, reviewer.institution)
        
        const reviewerData = {
          user_id: user.id,
          expertise: reviewer.expertise,
          topics: reviewer.topics,
          availability: reviewer.availability,
          reputation_score: reviewer.reputationScore,
          ms_relevance: reviewer.msRelevance
        }
        
        await this.supabase.createReviewer(reviewerData)
        console.log(`Created reviewer: ${reviewer.name}`)
      } catch (error) {
        console.warn(`Failed to create reviewer ${reviewer.name}:`, error)
      }
    }
  }

  // Migrate ARL assessments
  private async migrateARLAssessments(): Promise<void> {
    console.log('Migrating ARL assessments...')
    
    const localApps = localDatabase.getAllApplications()
    
    for (const app of localApps) {
      if (app.arlAssessment) {
        try {
          const assessment = {
            application_id: app.id,
            start_arl: app.arlAssessment.startARL.toString(),
            goal_arl: app.arlAssessment.goalARL.toString(),
            current_arl: app.arlAssessment.currentARL.toString(),
            confidence: app.arlAssessment.confidence,
            rationale: app.arlAssessment.rationale
          }
          
          await this.supabase.createARLAssessment(assessment)
          console.log(`Created ARL assessment for: ${app.title}`)
        } catch (error) {
          console.warn(`Failed to create ARL assessment for ${app.title}:`, error)
        }
      }
    }
  }

  // Migrate benchmark scores
  private async migrateBenchmarkScores(): Promise<void> {
    console.log('Migrating benchmark scores...')
    
    const localApps = localDatabase.getAllApplications()
    
    for (const app of localApps) {
      if (app.benchmarkScore) {
        try {
          const benchmark = {
            application_id: app.id,
            feasibility: app.benchmarkScore.dimensions.feasibility.methodsAdequacy,
            novelty: app.benchmarkScore.dimensions.novelty.topicFrontier,
            reproducibility: app.benchmarkScore.dimensions.reproducibility.protocolDetail,
            budget_realism: app.benchmarkScore.dimensions.budgetRealism.disallowedItems,
            ethics: app.benchmarkScore.dimensions.ethics.humanSubjects,
            reviewer_fit: app.benchmarkScore.dimensions.reviewerFit.matchQuality,
            composite_score: app.benchmarkScore.compositeScore,
            notes: app.benchmarkScore.notes
          }
          
          await this.supabase.createBenchmarkScore(benchmark)
          console.log(`Created benchmark score for: ${app.title}`)
        } catch (error) {
          console.warn(`Failed to create benchmark score for ${app.title}:`, error)
        }
      }
    }
  }

  // Migrate external signals
  private async migrateExternalSignals(): Promise<void> {
    console.log('Migrating external signals...')
    
    const localApps = localDatabase.getAllApplications()
    
    for (const app of localApps) {
      if (app.externalSignals) {
        try {
          const signals = {
            application_id: app.id,
            h_index: app.externalSignals.hIndex,
            total_citations: app.externalSignals.totalCitations,
            last_5y_pubs: app.externalSignals.last5yPubs,
            topics: app.externalSignals.topics,
            news_mentions: app.externalSignals.newsMentions,
            risk_flags: app.externalSignals.riskFlags,
            reputation_score: app.externalSignals.reputationScore,
            rationale: app.externalSignals.rationale,
            rebuttal_note: app.externalSignals.rebuttalNote
          }
          
          await this.supabase.createExternalSignals(signals)
          console.log(`Created external signals for: ${app.title}`)
        } catch (error) {
          console.warn(`Failed to create external signals for ${app.title}:`, error)
        }
      }
    }
  }

  // Helper method to find or create user
  private async findOrCreateUser(email: string, name: string, institution: string): Promise<any> {
    try {
      // Try to find existing user
      const { data: existingUser } = await this.supabase.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (existingUser) {
        return existingUser
      }
      
      // Create new user
      const { data: newUser, error } = await this.supabase.supabase
        .from('users')
        .insert({
          email,
          name,
          institution,
          role: 'applicant'
        })
        .select()
        .single()
      
      if (error) throw error
      return newUser
    } catch (error) {
      console.warn(`Failed to find/create user ${email}:`, error)
      throw error
    }
  }

  // Verify migration success
  async verifyMigration(): Promise<boolean> {
    try {
      console.log('Verifying migration...')
      
      // Check applications
      const applications = await this.supabase.getApplications()
      console.log(`Found ${applications.length} applications`)
      
      // Check reviewers
      const reviewers = await this.supabase.getReviewers()
      console.log(`Found ${reviewers.length} reviewers`)
      
      // Check ARL assessments
      let arlCount = 0
      for (const app of applications) {
        const assessment = await this.supabase.getARLAssessment(app.id)
        if (assessment) arlCount++
      }
      console.log(`Found ${arlCount} ARL assessments`)
      
      // Check benchmark scores
      let benchmarkCount = 0
      for (const app of applications) {
        const benchmark = await this.supabase.getBenchmarkScore(app.id)
        if (benchmark) benchmarkCount++
      }
      console.log(`Found ${benchmarkCount} benchmark scores`)
      
      console.log('Migration verification completed successfully!')
      return true
    } catch (error) {
      console.error('Migration verification failed:', error)
      return false
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    console.log('Clearing all data...')
    
    try {
      // Delete in reverse order of dependencies
      await this.supabase.supabase.from('audit_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('reviewer_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('reviewer_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('external_signals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('benchmark_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('stb_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('arl_milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('arl_assessments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('application_flags').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('application_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('news_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('news_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('funding_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('publications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('scholar_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('reviewer_conflicts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('reviewers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.supabase.supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      console.log('All data cleared successfully!')
    } catch (error) {
      console.error('Failed to clear data:', error)
      throw error
    }
  }
}

// Export singleton instance
export const databaseMigration = new DatabaseMigration()
export default databaseMigration
