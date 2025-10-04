import type {
  ARLAssessment,
  ARLProgress,
  ARLMilestoneStatus,
  ARLAction,
  STBAnswer
} from '../types/arlTypes'
import { ARL_MILESTONES } from '../data/arlKnowledgePack'

export class ARLService {
  // Compute ARL assessment from STB answers and evidence
  async computeARLAssessment(
    applicationId: string,
    stbAnswers: STBAnswer[],
    evidenceMilestones: ARLMilestoneStatus[]
  ): Promise<ARLAssessment> {
    
    // Determine start ARL from first evidence
    const startARL = this.determineStartARL(stbAnswers, evidenceMilestones)
    
    // Determine goal ARL from STB answers
    const goalARL = this.determineGoalARL(stbAnswers)
    
    // Compute current ARL based on milestones met
    const currentARL = this.computeCurrentARL(evidenceMilestones)
    
    // Calculate confidence based on evidence quality
    const confidence = this.calculateConfidence(evidenceMilestones, stbAnswers)
    
    // Generate rationale
    const rationale = this.generateRationale(startARL, currentARL, goalARL, evidenceMilestones)
    
    // Create assessment
    const assessment: ARLAssessment = {
      id: `arl-${applicationId}-${Date.now()}`,
      applicationId,
      startARL,
      goalARL,
      currentARL,
      confidence,
      rationale,
      milestones: evidenceMilestones,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return assessment
  }

  // Compute ARL progress from assessment
  computeARLProgress(assessment: ARLAssessment): ARLProgress {
    const milestonesMet = assessment.milestones.filter(m => m.met).length
    const milestonesTotal = ARL_MILESTONES.length
    const completionPercentage = (milestonesMet / milestonesTotal) * 100
    const gap = assessment.goalARL - assessment.currentARL

    // Find next milestones
    const nextMilestones = ARL_MILESTONES.filter(m => 
      m.level > assessment.currentARL && m.level <= assessment.goalARL
    )

    // Generate critical actions
    const criticalActions = this.generateCriticalActions(assessment)

    return {
      currentARL: assessment.currentARL,
      goalARL: assessment.goalARL,
      gap,
      milestonesMet,
      milestonesTotal,
      completionPercentage,
      nextMilestones,
      criticalActions
    }
  }

  // Determine start ARL from evidence
  private determineStartARL(stbAnswers: STBAnswer[], milestones: ARLMilestoneStatus[]): number {
    // Look for the lowest ARL level with evidence
    const evidenceLevels = milestones
      .filter(m => m.met)
      .map(m => this.extractARLLevel(m.milestoneCode))
      .sort((a, b) => a - b)

    if (evidenceLevels.length > 0) {
      return evidenceLevels[0]
    }

    // Fallback to STB answers
    const answerLevels = stbAnswers
      .map(answer => this.extractARLLevelFromAnswer(answer))
      .filter(level => level > 0)
      .sort((a, b) => a - b)

    return answerLevels.length > 0 ? answerLevels[0] : 1
  }

  // Determine goal ARL from STB answers
  private determineGoalARL(stbAnswers: STBAnswer[]): number {
    // Look for highest ARL level mentioned in answers
    const goalLevels = stbAnswers
      .map(answer => this.extractGoalARLFromAnswer(answer))
      .filter(level => level > 0)
      .sort((a, b) => b - a)

    return goalLevels.length > 0 ? goalLevels[0] : 6 // Default goal
  }

  // Compute current ARL based on milestones
  private computeCurrentARL(milestones: ARLMilestoneStatus[]): number {
    // ARL rule: current ARL is the highest level where ALL prior milestones are met
    for (let level = 9; level >= 1; level--) {
      if (this.areAllPriorMilestonesMet(level, milestones)) {
        return level
      }
    }
    return 1
  }

  // Check if all prior milestones are met for a given level
  private areAllPriorMilestonesMet(level: number, milestones: ARLMilestoneStatus[]): boolean {
    for (let i = 1; i <= level; i++) {
      const milestone = milestones.find(m => m.milestoneCode === `ARL${i}`)
      if (!milestone || !milestone.met) {
        return false
      }
    }
    return true
  }

  // Calculate confidence score
  private calculateConfidence(milestones: ARLMilestoneStatus[], stbAnswers: STBAnswer[]): number {
    if (milestones.length === 0) return 0

    // Average milestone confidence
    const milestoneConfidence = milestones.reduce((sum, m) => sum + m.confidence, 0) / milestones.length
    
    // STB answer quality
    const answerQuality = stbAnswers.reduce((sum, answer) => sum + answer.confidence, 0) / stbAnswers.length
    
    // Evidence density
    const evidenceDensity = milestones.filter(m => m.met).length / milestones.length
    
    // Combined confidence
    return (milestoneConfidence * 0.4 + answerQuality * 0.3 + evidenceDensity * 0.3)
  }

  // Generate rationale for ARL assessment
  private generateRationale(
    _startARL: number,
    currentARL: number,
    goalARL: number,
    milestones: ARLMilestoneStatus[]
  ): string {
    const metMilestones = milestones.filter(m => m.met)
    const totalMilestones = milestones.length

    let rationale = `Application shows ${currentARL} ARL maturity with ${metMilestones.length}/${totalMilestones} milestones met. `
    
    if (currentARL < goalARL) {
      rationale += `Gap of ${goalARL - currentARL} levels to reach goal ARL ${goalARL}. `
    }
    
    if (metMilestones.length > 0) {
      rationale += `Key achievements include: ${metMilestones.map(m => m.milestoneCode).join(', ')}. `
    }
    
    rationale += `Confidence level: ${Math.round(this.calculateConfidence(milestones, []) * 100)}%.`
    
    return rationale
  }

  // Generate critical actions
  private generateCriticalActions(assessment: ARLAssessment): ARLAction[] {
    const actions: ARLAction[] = []
    
    // Find missing milestones
    const missingMilestones = ARL_MILESTONES.filter(m => {
      const milestone = assessment.milestones.find(ms => ms.milestoneCode === m.code)
      return !milestone || !milestone.met
    })

    missingMilestones.forEach(milestone => {
      const priority = this.determineActionPriority(milestone.level, assessment.currentARL)
      
      actions.push({
        id: `action-${milestone.code}-${Date.now()}`,
        milestoneCode: milestone.code,
        title: `Complete ${milestone.title}`,
        description: milestone.actionTemplate,
        priority,
        actionType: this.determineActionType(milestone.level),
        suggestedDocuments: this.getSuggestedDocuments(milestone.level),
        deadline: this.calculateDeadline(priority)
      })
    })

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    })
  }

  // Extract ARL level from milestone code
  private extractARLLevel(milestoneCode: string): number {
    const match = milestoneCode.match(/ARL(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  // Extract ARL level from STB answer
  private extractARLLevelFromAnswer(_answer: STBAnswer): number {
    // This would use NLP to extract ARL level from answer text
    // For now, return a default based on question type
    return 1
  }

  // Extract goal ARL from STB answer
  private extractGoalARLFromAnswer(_answer: STBAnswer): number {
    // This would use NLP to extract goal ARL from answer text
    // For now, return a default
    return 6
  }

  // Determine action priority
  private determineActionPriority(milestoneLevel: number, currentARL: number): 'high' | 'medium' | 'low' {
    if (milestoneLevel <= currentARL + 1) return 'high'
    if (milestoneLevel <= currentARL + 2) return 'medium'
    return 'low'
  }

  // Determine action type
  private determineActionType(milestoneLevel: number): 'upload' | 'clarify' | 'provide' | 'complete' {
    if (milestoneLevel <= 3) return 'provide'
    if (milestoneLevel <= 6) return 'upload'
    return 'complete'
  }

  // Get suggested documents for milestone
  private getSuggestedDocuments(milestoneLevel: number): string[] {
    switch (milestoneLevel) {
      case 1:
      case 2:
        return ['Literature Review', 'Research Questions', 'Concept Document']
      case 3:
        return ['Proof of Concept', 'Component Testing Results', 'Viability Analysis']
      case 4:
        return ['Integration Plan', 'Technical Architecture', 'Organizational Chart']
      case 5:
        return ['Validation Results', 'Performance Metrics', 'Support Documentation']
      case 6:
        return ['Beta Testing Report', 'Operational Demo', 'Improvement Results']
      case 7:
        return ['Partner Integration', 'Workflow Documentation', 'User Acceptance']
      case 8:
        return ['User Approval', 'Qualification Certificate', 'Training Manual']
      case 9:
        return ['Sustained Use Evidence', 'Operational Metrics', 'Impact Report']
      default:
        return []
    }
  }

  // Calculate deadline based on priority
  private calculateDeadline(priority: 'high' | 'medium' | 'low'): Date {
    const now = new Date()
    switch (priority) {
      case 'high':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week
      case 'medium':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
      case 'low':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 1 month
    }
  }

  // Save ARL assessment
  async saveARLAssessment(assessment: ARLAssessment): Promise<void> {
    try {
      await fetch('/api/arl/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      })
    } catch (error) {
      console.error('Error saving ARL assessment:', error)
    }
  }

  // Load ARL assessment
  async loadARLAssessment(applicationId: string): Promise<ARLAssessment | null> {
    try {
      const response = await fetch(`/api/arl/assessment/${applicationId}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error loading ARL assessment:', error)
      return null
    }
  }
}

// Singleton instance
export const arlService = new ARLService()
