// Scholar Service for fetching and analyzing academic profiles
// This integrates with Google Scholar, ORCID, and other academic databases

export interface ScholarProfile {
  email: string
  name: string
  institution: string
  hIndex: number
  totalCitations: number
  last5yPubs: number
  publications: Publication[]
  topics: string[]
  expertise: string[]
  reputationScore: number
  msRelevance: number
  recentPublications: Publication[]
  collaborationNetwork: string[]
  fundingHistory: FundingRecord[]
  lastUpdated: Date
}

export interface Publication {
  title: string
  authors: string[]
  year: number
  journal: string
  citations: number
  abstract?: string
  keywords: string[]
  msRelevance: number
  impactFactor?: number
}

export interface FundingRecord {
  title: string
  agency: string
  amount: number
  year: number
  status: 'completed' | 'ongoing' | 'pending'
  msRelated: boolean
}

export interface NewsProfile {
  mentions: number
  controversies: string[]
  riskFlags: string[]
  mediaSentiment: 'positive' | 'neutral' | 'negative'
  recentNews: NewsItem[]
}

export interface NewsItem {
  title: string
  source: string
  date: string
  sentiment: 'positive' | 'neutral' | 'negative'
  url: string
}

export class ScholarService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

  // Fetch scholar profile by email
  async fetchScholarProfile(email: string): Promise<ScholarProfile> {
    try {
      const response = await fetch(`${this.baseURL}/api/scholar/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      // Fallback to mock data for development
      return this.generateMockProfile(email)
    } catch (error) {
      console.error('Error fetching scholar profile:', error)
      return this.generateMockProfile(email)
    }
  }

  // Analyze MS relevance using LLM
  async analyzeMSRelevance(publications: Publication[]): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/api/llm/analyze-ms-relevance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publications })
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.msRelevance
      }
      
      // Fallback calculation
      return this.calculateMSRelevance(publications)
    } catch (error) {
      console.error('Error analyzing MS relevance:', error)
      return this.calculateMSRelevance(publications)
    }
  }

  // Extract expertise areas using LLM
  async extractExpertise(publications: Publication[]): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/llm/extract-expertise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publications })
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.expertise
      }
      
      // Fallback extraction
      return this.extractExpertiseFromPublications(publications)
    } catch (error) {
      console.error('Error extracting expertise:', error)
      return this.extractExpertiseFromPublications(publications)
    }
  }

  // Calculate reputation score
  calculateReputationScore(profile: ScholarProfile): number {
    const hIndexWeight = 0.4
    const citationsWeight = 0.3
    const recentPubsWeight = 0.2
    const msRelevanceWeight = 0.1

    const hIndexScore = Math.min(profile.hIndex / 50, 1) // Normalize to 0-1
    const citationsScore = Math.min(profile.totalCitations / 5000, 1)
    const recentPubsScore = Math.min(profile.last5yPubs / 20, 1)
    const msRelevanceScore = profile.msRelevance / 100

    return (
      hIndexScore * hIndexWeight +
      citationsScore * citationsWeight +
      recentPubsScore * recentPubsWeight +
      msRelevanceScore * msRelevanceWeight
    ) * 100
  }

  // Generate mock profile for development
  private generateMockProfile(email: string): ScholarProfile {
    const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
    const institution = email.split('@')[1].split('.')[0]
    
    const publications = this.generateMockPublications()
    const topics = this.extractExpertiseFromPublications(publications)
    const msRelevance = this.calculateMSRelevance(publications)
    
    return {
      email,
      name: `Dr. ${name}`,
      institution: institution.charAt(0).toUpperCase() + institution.slice(1),
      hIndex: Math.floor(Math.random() * 30) + 10,
      totalCitations: Math.floor(Math.random() * 2000) + 500,
      last5yPubs: Math.floor(Math.random() * 15) + 5,
      publications,
      topics,
      expertise: topics,
      reputationScore: 0,
      msRelevance,
      recentPublications: publications.slice(0, 5),
      collaborationNetwork: this.generateMockCollaborators(),
      fundingHistory: this.generateMockFunding(),
      lastUpdated: new Date()
    }
  }

  // Generate mock publications
  private generateMockPublications(): Publication[] {
    const msKeywords = [
      'multiple sclerosis', 'MS', 'demyelination', 'neuroinflammation', 
      'remyelination', 'neurodegeneration', 'autoimmune', 'T cells',
      'B cells', 'cytokines', 'blood-brain barrier', 'oligodendrocytes'
    ]
    
    const generalKeywords = [
      'neuroscience', 'neurology', 'immunology', 'neuroimaging',
      'biomarkers', 'clinical trials', 'rehabilitation', 'genetics'
    ]

    const publications: Publication[] = []
    
    for (let i = 0; i < 20; i++) {
      const isMSRelated = Math.random() > 0.3
      const keywords = isMSRelated 
        ? msKeywords.slice(0, Math.floor(Math.random() * 4) + 2)
        : generalKeywords.slice(0, Math.floor(Math.random() * 3) + 1)
      
      publications.push({
        title: `Research Study ${i + 1}: ${isMSRelated ? 'MS' : 'Neurological'} Investigation`,
        authors: [`Dr. ${name.split(' ')[0]}`, 'Dr. Collaborator A', 'Dr. Collaborator B'],
        year: 2020 + Math.floor(Math.random() * 4),
        journal: `Journal of ${isMSRelated ? 'Multiple Sclerosis' : 'Neuroscience'}`,
        citations: Math.floor(Math.random() * 100),
        abstract: `This study investigates ${isMSRelated ? 'multiple sclerosis' : 'neurological'} mechanisms...`,
        keywords,
        msRelevance: isMSRelated ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
        impactFactor: Math.random() * 5 + 1
      })
    }
    
    return publications.sort((a, b) => b.year - a.year)
  }

  // Extract expertise from publications
  private extractExpertiseFromPublications(publications: Publication[]): string[] {
    const topicCounts: { [key: string]: number } = {}
    
    publications.forEach(pub => {
      pub.keywords.forEach(keyword => {
        topicCounts[keyword] = (topicCounts[keyword] || 0) + 1
      })
    })
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)
  }

  // Calculate MS relevance
  private calculateMSRelevance(publications: Publication[]): number {
    if (publications.length === 0) return 0
    
    const msKeywords = [
      'multiple sclerosis', 'MS', 'demyelination', 'neuroinflammation',
      'remyelination', 'neurodegeneration', 'autoimmune'
    ]
    
    let totalRelevance = 0
    let msRelatedCount = 0
    
    publications.forEach(pub => {
      const hasMSKeywords = pub.keywords.some(keyword => 
        msKeywords.some(msKeyword => 
          keyword.toLowerCase().includes(msKeyword.toLowerCase())
        )
      )
      
      if (hasMSKeywords) {
        msRelatedCount++
        totalRelevance += pub.msRelevance
      }
    })
    
    return msRelatedCount > 0 ? totalRelevance / msRelatedCount : 0
  }

  // Generate mock collaborators
  private generateMockCollaborators(): string[] {
    const collaborators = [
      'Dr. Sarah Johnson (Harvard)',
      'Dr. Michael Chen (MIT)',
      'Dr. Lisa Rodriguez (Stanford)',
      'Dr. Robert Kim (Yale)',
      'Dr. Emily Watson (UCSF)'
    ]
    
    return collaborators.slice(0, Math.floor(Math.random() * 3) + 2)
  }

  // Generate mock funding history
  private generateMockFunding(): FundingRecord[] {
    const agencies = ['NIH', 'NSF', 'NMSS', 'Wellcome Trust', 'European Commission']
    const statuses: ('completed' | 'ongoing' | 'pending')[] = ['completed', 'ongoing', 'pending']
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
      title: `Research Grant ${i + 1}`,
      agency: agencies[Math.floor(Math.random() * agencies.length)],
      amount: Math.floor(Math.random() * 500000) + 100000,
      year: 2020 + Math.floor(Math.random() * 4),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      msRelated: Math.random() > 0.3
    }))
  }

  // Fetch news profile
  async fetchNewsProfile(name: string): Promise<NewsProfile> {
    try {
      const response = await fetch(`${this.baseURL}/api/news/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      // Fallback to mock data
      return this.generateMockNewsProfile(name)
    } catch (error) {
      console.error('Error fetching news profile:', error)
      return this.generateMockNewsProfile(name)
    }
  }

  // Generate mock news profile
  private generateMockNewsProfile(name: string): NewsProfile {
    return {
      mentions: Math.floor(Math.random() * 20) + 5,
      controversies: Math.random() > 0.8 ? ['Retraction notice'] : [],
      riskFlags: Math.random() > 0.9 ? ['Ethics violation'] : [],
      mediaSentiment: Math.random() > 0.7 ? 'positive' : 'neutral',
      recentNews: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
        title: `Research breakthrough in ${name}'s field`,
        source: 'Science Daily',
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
        url: `https://example.com/news/${i}`
      }))
    }
  }

  // Update profile with new data
  async updateProfile(email: string, newData: Partial<ScholarProfile>): Promise<ScholarProfile> {
    try {
      const response = await fetch(`${this.baseURL}/api/scholar/profile/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error('Failed to update profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Search for profiles
  async searchProfiles(query: string): Promise<ScholarProfile[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/scholar/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('Error searching profiles:', error)
      return []
    }
  }
}

// Export singleton instance
export const scholarService = new ScholarService()
