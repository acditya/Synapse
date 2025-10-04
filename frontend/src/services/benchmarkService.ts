import type { BenchmarkDimensions, BenchmarkScore } from '../types/arlTypes'
import { BENCHMARK_WEIGHTS, COMPLIANCE_REQUIREMENTS } from '../data/arlKnowledgePack'

export class BenchmarkService {
  // Compute benchmark scores for an application
  async computeBenchmarkScores(
    applicationId: string,
    applicationData: any,
    arlAssessment: any
  ): Promise<BenchmarkScore> {
    
    // Compute individual dimension scores
    const dimensions = await this.computeDimensionScores(applicationData, arlAssessment)
    
    // Calculate composite score
    const compositeScore = this.calculateCompositeScore(dimensions)
    
    // Calculate percentile
    const percentile = await this.calculatePercentile(compositeScore)
    
    // Generate notes and recommendations
    const notes = this.generateNotes(dimensions)
    const recommendations = this.generateRecommendations(dimensions, notes)
    
    return {
      applicationId,
      dimensions,
      compositeScore,
      percentile,
      notes,
      recommendations,
      createdAt: new Date()
    }
  }

  // Compute individual dimension scores
  private async computeDimensionScores(applicationData: any, _arlAssessment: any): Promise<BenchmarkDimensions> {
    return {
      feasibility: await this.computeFeasibilityScore(applicationData),
      novelty: await this.computeNoveltyScore(applicationData),
      reproducibility: await this.computeReproducibilityScore(applicationData),
      budgetRealism: await this.computeBudgetScore(applicationData),
      ethics: await this.computeEthicsScore(applicationData),
      reviewerFit: await this.computeReviewerFitScore(applicationData)
    }
  }

  // Compute feasibility score
  private async computeFeasibilityScore(applicationData: any): Promise<BenchmarkDimensions['feasibility']> {
    const methodsAdequacy = this.scoreMethodsAdequacy(applicationData.methods)
    const resources = this.scoreResources(applicationData.resources)
    const timelineRealism = this.scoreTimelineRealism(applicationData.timeline)
    const sampleSize = this.scoreSampleSize(applicationData.sampleSize)
    const riskMitigation = this.scoreRiskMitigation(applicationData.risks)

    return {
      methodsAdequacy,
      resources,
      timelineRealism,
      sampleSize,
      riskMitigation
    }
  }

  // Compute novelty score
  private async computeNoveltyScore(applicationData: any): Promise<BenchmarkDimensions['novelty']> {
    const topicFrontier = this.scoreTopicFrontier(applicationData.topic)
    const msRelevance = this.scoreMSRelevance(applicationData.aims)
    const citationQuality = this.scoreCitationQuality(applicationData.references)

    return {
      topicFrontier,
      msRelevance,
      citationQuality
    }
  }

  // Compute reproducibility score
  private async computeReproducibilityScore(applicationData: any): Promise<BenchmarkDimensions['reproducibility']> {
    const protocolDetail = this.scoreProtocolDetail(applicationData.methods)
    const dataCodePlan = this.scoreDataCodePlan(applicationData.dataPlan)
    const preregistration = this.scorePreregistration(applicationData.preregistration)

    return {
      protocolDetail,
      dataCodePlan,
      preregistration
    }
  }

  // Compute budget score
  private async computeBudgetScore(applicationData: any): Promise<BenchmarkDimensions['budgetRealism']> {
    const disallowedItems = this.scoreDisallowedItems(applicationData.budget)
    const indirectCaps = this.scoreIndirectCaps(applicationData.budget)
    const unitCosts = this.scoreUnitCosts(applicationData.budget)
    const contingency = this.scoreContingency(applicationData.budget)

    return {
      disallowedItems,
      indirectCaps,
      unitCosts,
      contingency
    }
  }

  // Compute ethics score
  private async computeEthicsScore(applicationData: any): Promise<BenchmarkDimensions['ethics']> {
    const humanSubjects = this.scoreHumanSubjects(applicationData.ethics)
    const mohapCompliance = this.scoreMoHAPCompliance(applicationData.ethics)
    const dataPrivacy = this.scoreDataPrivacy(applicationData.ethics)
    const vulnerablePopulations = this.scoreVulnerablePopulations(applicationData.ethics)

    return {
      humanSubjects,
      mohapCompliance,
      dataPrivacy,
      vulnerablePopulations
    }
  }

  // Compute reviewer fit score
  private async computeReviewerFitScore(applicationData: any): Promise<BenchmarkDimensions['reviewerFit']> {
    const matchQuality = this.scoreMatchQuality(applicationData.reviewers)
    const conflictCleanliness = this.scoreConflictCleanliness(applicationData.reviewers)

    return {
      matchQuality,
      conflictCleanliness
    }
  }

  // Individual scoring methods
  private scoreMethodsAdequacy(methods: any): number {
    if (!methods) return 0
    
    let score = 0
    if (methods.design) score += 20
    if (methods.statisticalPlan) score += 20
    if (methods.sampleSizeCalculation) score += 20
    if (methods.dataCollection) score += 20
    if (methods.analysisPlan) score += 20
    
    return Math.min(score, 100)
  }

  private scoreResources(resources: any): number {
    if (!resources) return 0
    
    let score = 0
    if (resources.personnel) score += 25
    if (resources.equipment) score += 25
    if (resources.facilities) score += 25
    if (resources.collaborations) score += 25
    
    return Math.min(score, 100)
  }

  private scoreTimelineRealism(timeline: any): number {
    if (!timeline) return 0
    
    const months = timeline.duration || 0
    if (months <= 12) return 100
    if (months <= 24) return 80
    if (months <= 36) return 60
    return 40
  }

  private scoreSampleSize(sampleSize: any): number {
    if (!sampleSize) return 0
    
    const n = sampleSize.n || 0
    if (n >= 100) return 100
    if (n >= 50) return 80
    if (n >= 30) return 60
    if (n >= 10) return 40
    return 20
  }

  private scoreRiskMitigation(risks: any): number {
    if (!risks) return 0
    
    let score = 0
    if (risks.identified) score += 30
    if (risks.mitigationPlan) score += 30
    if (risks.contingencyPlan) score += 20
    if (risks.monitoringPlan) score += 20
    
    return Math.min(score, 100)
  }

  private scoreTopicFrontier(topic: any): number {
    if (!topic) return 0
    
    // This would use NLP to assess topic novelty
    return 75 // Placeholder
  }

  private scoreMSRelevance(aims: any): number {
    if (!aims) return 0
    
    const msKeywords = ['multiple sclerosis', 'MS', 'demyelination', 'neuroinflammation', 'remyelination']
    const text = (aims.text || '').toLowerCase()
    
    let score = 0
    msKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 20
    })
    
    return Math.min(score, 100)
  }

  private scoreCitationQuality(references: any): number {
    if (!references) return 0
    
    const recentCount = references.recent || 0
    const totalCount = references.total || 1
    
    return Math.min((recentCount / totalCount) * 100, 100)
  }

  private scoreProtocolDetail(methods: any): number {
    if (!methods) return 0
    
    let score = 0
    if (methods.detailedProtocol) score += 40
    if (methods.standardizedProcedures) score += 30
    if (methods.qualityControl) score += 30
    
    return Math.min(score, 100)
  }

  private scoreDataCodePlan(dataPlan: any): number {
    if (!dataPlan) return 0
    
    let score = 0
    if (dataPlan.dataManagement) score += 30
    if (dataPlan.codeSharing) score += 30
    if (dataPlan.reproducibility) score += 40
    
    return Math.min(score, 100)
  }

  private scorePreregistration(preregistration: any): number {
    if (!preregistration) return 0
    
    return preregistration.registered ? 100 : 0
  }

  private scoreDisallowedItems(budget: any): number {
    if (!budget) return 0
    
    const disallowedItems = budget.disallowedItems || []
    return disallowedItems.length === 0 ? 100 : 0
  }

  private scoreIndirectCaps(budget: any): number {
    if (!budget) return 0
    
    const indirectRate = budget.indirectRate || 0
    return indirectRate <= 20 ? 100 : Math.max(100 - (indirectRate - 20) * 2, 0)
  }

  private scoreUnitCosts(budget: any): number {
    if (!budget) return 0
    
    // This would compare against standard costs
    return 80 // Placeholder
  }

  private scoreContingency(budget: any): number {
    if (!budget) return 0
    
    const contingencyRate = budget.contingencyRate || 0
    return contingencyRate >= 5 && contingencyRate <= 15 ? 100 : 60
  }

  private scoreHumanSubjects(ethics: any): number {
    if (!ethics) return 0
    
    let score = 0
    if (ethics.irbApproval) score += 40
    if (ethics.informedConsent) score += 30
    if (ethics.protectionMeasures) score += 30
    
    return Math.min(score, 100)
  }

  private scoreMoHAPCompliance(ethics: any): number {
    if (!ethics) return 0
    
    let score = 0
    if (ethics.mohapApproval) score += 50
    if (ethics.localIRB) score += 30
    if (ethics.dataPrivacy) score += 20
    
    return Math.min(score, 100)
  }

  private scoreDataPrivacy(ethics: any): number {
    if (!ethics) return 0
    
    let score = 0
    if (ethics.dataProtection) score += 40
    if (ethics.consentManagement) score += 30
    if (ethics.anonymization) score += 30
    
    return Math.min(score, 100)
  }

  private scoreVulnerablePopulations(ethics: any): number {
    if (!ethics) return 0
    
    let score = 0
    if (ethics.vulnerableProtection) score += 50
    if (ethics.specialConsent) score += 30
    if (ethics.monitoring) score += 20
    
    return Math.min(score, 100)
  }

  private scoreMatchQuality(reviewers: any): number {
    if (!reviewers) return 0
    
    return reviewers.matchScore || 0
  }

  private scoreConflictCleanliness(reviewers: any): number {
    if (!reviewers) return 0
    
    const conflicts = reviewers.conflicts || []
    return conflicts.length === 0 ? 100 : Math.max(100 - conflicts.length * 20, 0)
  }

  // Calculate composite score
  private calculateCompositeScore(dimensions: BenchmarkDimensions): number {
    const feasibility = this.calculateDimensionScore(dimensions.feasibility)
    const novelty = this.calculateDimensionScore(dimensions.novelty)
    const reproducibility = this.calculateDimensionScore(dimensions.reproducibility)
    const budget = this.calculateDimensionScore(dimensions.budgetRealism)
    const ethics = this.calculateDimensionScore(dimensions.ethics)
    const reviewerFit = this.calculateDimensionScore(dimensions.reviewerFit)

    return (
      feasibility * BENCHMARK_WEIGHTS.feasibility +
      novelty * BENCHMARK_WEIGHTS.novelty +
      reproducibility * BENCHMARK_WEIGHTS.reproducibility +
      budget * BENCHMARK_WEIGHTS.budget +
      ethics * BENCHMARK_WEIGHTS.ethics +
      reviewerFit * 0.05 // 5% for reviewer fit
    )
  }

  // Calculate dimension score
  private calculateDimensionScore(dimension: any): number {
    const values = Object.values(dimension) as number[]
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  // Calculate percentile
  private async calculatePercentile(compositeScore: number): Promise<number> {
    try {
      const response = await fetch('/api/benchmarks/percentile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: compositeScore })
      })
      
      const result = await response.json()
      return result.percentile || 50
    } catch (error) {
      console.error('Error calculating percentile:', error)
      return 50
    }
  }

  // Generate notes
  private generateNotes(dimensions: BenchmarkDimensions): string[] {
    const notes: string[] = []
    
    // Feasibility notes
    if (dimensions.feasibility.sampleSize < 50) {
      notes.push('Sample size may be insufficient for robust statistical power')
    }
    
    // Ethics notes
    if (dimensions.ethics.mohapCompliance < 80) {
      notes.push('MoHAP compliance requirements need attention')
    }
    
    // Budget notes
    if (dimensions.budgetRealism.disallowedItems < 100) {
      notes.push('Budget contains disallowed items')
    }
    
    return notes
  }

  // Generate recommendations
  private generateRecommendations(_dimensions: BenchmarkDimensions, notes: string[]): string[] {
    const recommendations: string[] = []
    
    if (notes.includes('Sample size may be insufficient')) {
      recommendations.push('Consider increasing sample size or providing power analysis')
    }
    
    if (notes.includes('MoHAP compliance requirements need attention')) {
      recommendations.push('Ensure MoHAP approval and local IRB compliance')
    }
    
    if (notes.includes('Budget contains disallowed items')) {
      recommendations.push('Review budget for disallowed items and adjust accordingly')
    }
    
    return recommendations
  }

  // Save benchmark scores
  async saveBenchmarkScores(score: BenchmarkScore): Promise<void> {
    try {
      await fetch('/api/benchmarks/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      })
    } catch (error) {
      console.error('Error saving benchmark scores:', error)
    }
  }

  // Load benchmark scores
  async loadBenchmarkScores(applicationId: string): Promise<BenchmarkScore | null> {
    try {
      const response = await fetch(`/api/benchmarks/scores/${applicationId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error loading benchmark scores:', error)
      return null
    }
  }
}

// Singleton instance
export const benchmarkService = new BenchmarkService()
