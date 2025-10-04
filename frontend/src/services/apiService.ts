// API Service for ARL Integration
// This would connect to the FastAPI backend

export class APIService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

  // STB Interview API
  async startSTBInterview(applicationId: string) {
    const response = await fetch(`${this.baseURL}/api/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId })
    })
    return response.json()
  }

  async submitSTBAnswer(sessionId: string, questionId: string, answer: string) {
    const response = await fetch(`${this.baseURL}/api/interview/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, answer })
    })
    return response.json()
  }

  // ARL Computation API
  async computeARL(applicationId: string, answers: any[], artifacts: any[]) {
    const response = await fetch(`${this.baseURL}/api/arl/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, answers, artifacts })
    })
    return response.json()
  }

  // Evidence Mapping API
  async mapEvidence(applicationId: string, documents: any[]) {
    const response = await fetch(`${this.baseURL}/api/evidence/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, documents })
    })
    return response.json()
  }

  async verifyEvidence(milestoneCode: string, evidence: any) {
    const response = await fetch(`${this.baseURL}/api/evidence/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneCode, evidence })
    })
    return response.json()
  }

  // Benchmarking API
  async computeBenchmarks(applicationId: string, data: any) {
    const response = await fetch(`${this.baseURL}/api/benchmarks/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, data })
    })
    return response.json()
  }

  // External Signals API
  async getProfileSignals(email: string, orcid?: string) {
    const response = await fetch(`${this.baseURL}/api/signals/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, orcid })
    })
    return response.json()
  }

  async getScholarProfile(email: string) {
    const response = await fetch(`${this.baseURL}/api/signals/scholar/${email}`)
    return response.json()
  }

  async getNewsSignals(name: string) {
    const response = await fetch(`${this.baseURL}/api/signals/news/${name}`)
    return response.json()
  }

  // Reviewer Enhancement API
  async getReviewerRecommendations(applicationId: string, arlContext: any) {
    const response = await fetch(`${this.baseURL}/api/reviewers/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, arlContext })
    })
    return response.json()
  }

  async checkConflicts(reviewerId: string, applicationId: string) {
    const response = await fetch(`${this.baseURL}/api/reviewers/conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, applicationId })
    })
    return response.json()
  }

  // Summary and Export API
  async generateBrief(applicationId: string) {
    const response = await fetch(`${this.baseURL}/api/summary/brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId })
    })
    return response.json()
  }

  async exportPDF(applicationId: string, format: 'brief' | 'full' = 'brief') {
    const response = await fetch(`${this.baseURL}/api/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, format })
    })
    return response.blob()
  }

  async exportCSV(applicationId: string) {
    const response = await fetch(`${this.baseURL}/api/export/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId })
    })
    return response.blob()
  }

  // TTS/STT API
  async speakText(text: string, language: string = 'en') {
    const response = await fetch(`${this.baseURL}/api/tts/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    })
    return response.blob()
  }

  async transcribeAudio(audioBlob: Blob, language: string = 'en') {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    formData.append('language', language)

    const response = await fetch(`${this.baseURL}/api/stt/transcribe`, {
      method: 'POST',
      body: formData
    })
    return response.json()
  }

  // LLM API
  async normalizeAnswer(question: string, answer: string, schema: any) {
    const response = await fetch(`${this.baseURL}/api/llm/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, schema })
    })
    return response.json()
  }

  async verifyEvidenceWithLLM(milestoneCode: string, blocks: any[], answer: string) {
    const response = await fetch(`${this.baseURL}/api/llm/verify-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneCode, blocks, answer })
    })
    return response.json()
  }

  async generateReviewDraft(applicationData: any) {
    const response = await fetch(`${this.baseURL}/api/llm/review-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    })
    return response.json()
  }
}

// Singleton instance
export const apiService = new APIService()
