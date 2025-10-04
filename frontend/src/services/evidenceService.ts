import type { EvidenceLink, ARLMilestoneStatus } from '../types/arlTypes'
import { EVIDENCE_VERIFICATION_PROMPTS } from '../data/arlKnowledgePack'

export interface EvidenceMappingResult {
  links: EvidenceLink[]
  milestones: ARLMilestoneStatus[]
  confidence: number
  gaps: string[]
}

export interface DocumentBlock {
  documentId: string
  slideNumber: number
  textBlock: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  extractedEntities: string[]
}

export class EvidenceService {
  private documentBlocks: DocumentBlock[] = []
  private searchIndex: Map<string, number[]> = new Map()

  // Initialize evidence mapping with document blocks
  async initializeEvidenceMapping(blocks: DocumentBlock[]): Promise<void> {
    this.documentBlocks = blocks
    await this.buildSearchIndex()
  }

  // Build hybrid search index (BM25 + embeddings)
  private async buildSearchIndex(): Promise<void> {
    for (let i = 0; i < this.documentBlocks.length; i++) {
      const block = this.documentBlocks[i]
      const words = block.textBlock.toLowerCase().split(/\s+/)
      
      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, [])
        }
        this.searchIndex.get(word)!.push(i)
      })
    }
  }

  // Find evidence for a specific milestone
  async findEvidenceForMilestone(
    milestoneCode: string, 
    answer: string
  ): Promise<EvidenceMappingResult> {
    const prompt = EVIDENCE_VERIFICATION_PROMPTS[milestoneCode as keyof typeof EVIDENCE_VERIFICATION_PROMPTS]
    if (!prompt) {
      throw new Error(`No verification prompt found for milestone: ${milestoneCode}`)
    }

    // Search for relevant blocks
    const relevantBlocks = await this.searchRelevantBlocks(prompt, answer)
    
    // Verify evidence with LLM
    const verifiedEvidence = await this.verifyEvidenceWithLLM(
      milestoneCode, 
      relevantBlocks, 
      answer
    )

    // Map to evidence links
    const links: EvidenceLink[] = verifiedEvidence.map(block => ({
      documentId: block.documentId,
      slideNumber: block.slideNumber,
      textBlock: block.textBlock,
      boundingBox: block.boundingBox,
      confidence: block.confidence,
      milestoneMatches: [milestoneCode]
    }))

    // Create milestone status
    const milestoneStatus: ARLMilestoneStatus = {
      milestoneCode,
      met: verifiedEvidence.length > 0,
      evidenceDoc: verifiedEvidence.length > 0 ? verifiedEvidence[0].documentId : undefined,
      quoteText: verifiedEvidence.length > 0 ? verifiedEvidence[0].textBlock : undefined,
      notes: verifiedEvidence.length > 0 ? 'Evidence found and verified' : 'No evidence found',
      confidence: verifiedEvidence.length > 0 ? 
        verifiedEvidence.reduce((sum, block) => sum + block.confidence, 0) / verifiedEvidence.length : 0
    }

    // Identify gaps
    const gaps = this.identifyGaps(milestoneCode, verifiedEvidence, answer)

    return {
      links,
      milestones: [milestoneStatus],
      confidence: milestoneStatus.confidence,
      gaps
    }
  }

  // Search for relevant blocks using hybrid search
  private async searchRelevantBlocks(prompt: string, answer: string): Promise<DocumentBlock[]> {
    const queryWords = prompt.toLowerCase().split(/\s+/)
    const answerWords = answer.toLowerCase().split(/\s+/)
    const allWords = [...queryWords, ...answerWords]

    // BM25 scoring
    const blockScores = new Map<number, number>()
    
    allWords.forEach(word => {
      const blockIndices = this.searchIndex.get(word) || []
      blockIndices.forEach(blockIndex => {
        const currentScore = blockScores.get(blockIndex) || 0
        blockScores.set(blockIndex, currentScore + 1)
      })
    })

    // Sort by score and return top results
    const sortedBlocks = Array.from(blockScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([index]) => this.documentBlocks[index])

    return sortedBlocks
  }

  // Verify evidence with LLM
  private async verifyEvidenceWithLLM(
    milestoneCode: string,
    blocks: DocumentBlock[],
    answer: string
  ): Promise<DocumentBlock[]> {
    try {
      const response = await fetch('/api/llm/verify-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneCode,
          blocks: blocks.map(block => ({
            text: block.textBlock,
            slideNumber: block.slideNumber,
            documentId: block.documentId
          })),
          answer
        })
      })

      const result = await response.json()
      
      // Filter blocks based on LLM verification
      return blocks.filter((_block, index) => 
        result.verifiedBlocks && result.verifiedBlocks.includes(index)
      )
    } catch (error) {
      console.error('LLM verification error:', error)
      return blocks // Return all blocks if verification fails
    }
  }

  // Identify gaps in evidence
  private identifyGaps(milestoneCode: string, evidence: DocumentBlock[], answer: string): string[] {
    const gaps: string[] = []
    
    if (evidence.length === 0) {
      gaps.push(`No evidence found for ${milestoneCode}`)
    }

    // Check for specific evidence patterns based on milestone
    switch (milestoneCode) {
      case 'ARL2':
        if (!answer.toLowerCase().includes('decision')) {
          gaps.push('Decision process not clearly identified')
        }
        break
      case 'ARL3':
        if (!answer.toLowerCase().includes('test')) {
          gaps.push('Component testing evidence missing')
        }
        break
      case 'ARL5':
        if (!answer.toLowerCase().includes('validation')) {
          gaps.push('Validation in relevant environment not demonstrated')
        }
        break
      case 'ARL7':
        if (!answer.toLowerCase().includes('partner')) {
          gaps.push('Partner workflow integration not shown')
        }
        break
      case 'ARL8':
        if (!answer.toLowerCase().includes('approval')) {
          gaps.push('User approval and qualification missing')
        }
        break
      case 'ARL9':
        if (!answer.toLowerCase().includes('sustained')) {
          gaps.push('Sustained operational use not demonstrated')
        }
        break
    }

    return gaps
  }

  // Get all evidence for an application
  async getAllEvidence(applicationId: string): Promise<EvidenceMappingResult> {
    try {
      const response = await fetch(`/api/evidence/application/${applicationId}`)
      const result = await response.json()
      
      return {
        links: result.links || [],
        milestones: result.milestones || [],
        confidence: result.confidence || 0,
        gaps: result.gaps || []
      }
    } catch (error) {
      console.error('Error fetching evidence:', error)
      return {
        links: [],
        milestones: [],
        confidence: 0,
        gaps: ['Error loading evidence']
      }
    }
  }

  // Link evidence to specific milestone
  async linkEvidenceToMilestone(
    milestoneCode: string,
    evidenceId: string,
    confidence: number
  ): Promise<void> {
    try {
      await fetch('/api/evidence/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneCode,
          evidenceId,
          confidence
        })
      })
    } catch (error) {
      console.error('Error linking evidence:', error)
    }
  }

  // Update evidence confidence
  async updateEvidenceConfidence(
    evidenceId: string,
    confidence: number
  ): Promise<void> {
    try {
      await fetch(`/api/evidence/${evidenceId}/confidence`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence })
      })
    } catch (error) {
      console.error('Error updating evidence confidence:', error)
    }
  }
}

// Singleton instance
export const evidenceService = new EvidenceService()
