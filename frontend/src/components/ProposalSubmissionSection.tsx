import { useState, useRef, useCallback } from 'react'
import type { FormData, ValidationErrors } from '../types/formTypes'

interface ProposalSubmissionSectionProps {
  formData: FormData
  validationErrors: ValidationErrors
  updateFormData: (updates: Partial<FormData>) => void
  updateValidationErrors: (errors: Partial<ValidationErrors>) => void
}

const ProposalSubmissionSection = ({
  formData,
  validationErrors,
  updateFormData,
  updateValidationErrors
}: ProposalSubmissionSectionProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [aiInsights, setAiInsights] = useState<{
    summary: string
    keywords: string[]
    priorities: string[]
  }>({ summary: '', keywords: [], priorities: [] })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      updateValidationErrors({ 
        proposalFile: 'Please upload a PDF or Word document (.pdf, .docx, .doc)' 
      })
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      updateValidationErrors({ 
        proposalFile: 'File size must be less than 10MB' 
      })
      return
    }

    updateFormData({ proposalFile: file })
    updateValidationErrors({ proposalFile: undefined })
    
    // Simulate AI processing
    setIsProcessingFile(true)
    
    setTimeout(() => {
      // Mock AI analysis results
      const mockInsights = {
        summary: "This proposal focuses on investigating the role of microglia in multiple sclerosis progression, with particular emphasis on neuroinflammation mechanisms and potential therapeutic targets. The research aims to develop novel biomarkers for early MS detection.",
        keywords: ["microglia", "neuroinflammation", "biomarkers", "therapeutic targets", "early detection"],
        priorities: ["Neuroinflammation Research", "Biomarker Development", "Therapeutic Innovation"]
      }
      
      setAiInsights(mockInsights)
      updateFormData({
        aiSummary: mockInsights.summary,
        autoKeywords: mockInsights.keywords,
        researchPriorities: mockInsights.priorities
      })
      setIsProcessingFile(false)
    }, 2000)
  }, [updateFormData, updateValidationErrors])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ proposalTitle: e.target.value })
    updateValidationErrors({ proposalTitle: undefined })
  }

  const handleAbstractChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ abstract: e.target.value })
    updateValidationErrors({ abstract: undefined })
  }

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ keywords: e.target.value })
  }

  const addSuggestedKeyword = (keyword: string) => {
    const currentKeywords = formData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
    if (!currentKeywords.includes(keyword)) {
      const newKeywords = [...currentKeywords, keyword].join(', ')
      updateFormData({ keywords: newKeywords })
    }
  }

  return (
    <div className="form-section">
      <h2>Research Proposal Submission</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Upload your research proposal and provide key details. Our AI will analyze 
        your proposal to provide insights and suggestions.
      </p>

      {/* File Upload Section */}
      <div className="form-group">
        <label className="form-label">
          Research Proposal File *
        </label>
        <div
          className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="file-upload-icon">📄</div>
          <div>
            <strong>Click to upload or drag and drop</strong>
            <br />
            <span style={{ color: 'var(--medium-gray)' }}>
              PDF, DOC, or DOCX (max 10MB)
            </span>
          </div>
          {formData.proposalFile && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--light-sea-green)', color: 'var(--white)', borderRadius: '0.25rem' }}>
              ✓ {formData.proposalFile.name} ({(formData.proposalFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        {validationErrors.proposalFile && (
          <div className="form-error">{validationErrors.proposalFile}</div>
        )}
      </div>

      {/* AI Processing Indicator */}
      {isProcessingFile && (
        <div className="ai-suggestion">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="spinner"></span>
            <span>AI is analyzing your proposal...</span>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.summary && !isProcessingFile && (
        <div className="ai-suggestion">
          <h4>🤖 AI Analysis Results</h4>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Auto-generated Summary:</strong>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
              {aiInsights.summary}
            </p>
          </div>
          
          {aiInsights.priorities.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Research Priority Alignment:</strong>
              <div className="priority-badges">
                {aiInsights.priorities.map((priority, index) => (
                  <span key={index} className="badge badge-primary">
                    {priority}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposal Title */}
      <div className="form-group">
        <label htmlFor="proposalTitle" className="form-label">
          Proposal Title *
        </label>
        <input
          type="text"
          id="proposalTitle"
          className="form-input"
          value={formData.proposalTitle}
          onChange={handleTitleChange}
          placeholder="Enter a clear, descriptive title for your research proposal"
          required
        />
        {validationErrors.proposalTitle && (
          <div className="form-error">{validationErrors.proposalTitle}</div>
        )}
      </div>

      {/* Abstract */}
      <div className="form-group">
        <label htmlFor="abstract" className="form-label">
          Abstract *
        </label>
        <textarea
          id="abstract"
          className="form-textarea"
          value={formData.abstract}
          onChange={handleAbstractChange}
          placeholder="Provide a comprehensive abstract of your research proposal (250-500 words recommended)"
          rows={6}
          required
        />
        <div style={{ fontSize: '0.875rem', color: 'var(--medium-gray)', marginTop: '0.25rem' }}>
          {formData.abstract.length} characters
        </div>
        {validationErrors.abstract && (
          <div className="form-error">{validationErrors.abstract}</div>
        )}
      </div>

      {/* Keywords */}
      <div className="form-group">
        <label htmlFor="keywords" className="form-label">
          Keywords / Research Focus
        </label>
        <input
          type="text"
          id="keywords"
          className="form-input"
          value={formData.keywords}
          onChange={handleKeywordsChange}
          placeholder="Enter keywords separated by commas (e.g., multiple sclerosis, neuroinflammation, biomarkers)"
        />
        
        {/* AI Suggested Keywords */}
        {aiInsights.keywords.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--medium-gray)', marginBottom: '0.5rem' }}>
              AI-suggested keywords:
            </div>
            <div className="priority-badges">
              {aiInsights.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="badge badge-secondary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => addSuggestedKeyword(keyword)}
                >
                  + {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Pre-review Feedback */}
      {aiInsights.summary && (
        <div className="ai-suggestion">
          <h4>📋 Pre-submission Review</h4>
          <p>
            Based on our analysis, your proposal appears to align well with NMSS research priorities. 
            Consider emphasizing the translational potential and clinical relevance of your research 
            in the full proposal document.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProposalSubmissionSection
