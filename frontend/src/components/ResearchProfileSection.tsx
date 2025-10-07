import { useState, useEffect } from 'react'
import type { FormData, ValidationErrors, PublicationData } from '../types/formTypes'

interface ResearchProfileSectionProps {
  formData: FormData
  validationErrors: ValidationErrors
  updateFormData: (updates: Partial<FormData>) => void
  updateValidationErrors: (errors: Partial<ValidationErrors>) => void
}

const ResearchProfileSection = ({
  formData,
  validationErrors,
  updateFormData,
  updateValidationErrors
}: ResearchProfileSectionProps) => {
  const [publications, setPublications] = useState<PublicationData[]>([])
  const [isLoadingPublications, setIsLoadingPublications] = useState(false)
  const [previousSubmissionWarning, setPreviousSubmissionWarning] = useState('')

  // Simulate fetching publications when Scopus ID or Google Scholar URL is provided
  useEffect(() => {
    const fetchPublications = async () => {
      if (!formData.scopusId && !formData.googleScholarUrl) {
        setPublications([])
        return
      }

      setIsLoadingPublications(true)
      
      // Simulate API call
      setTimeout(() => {
        const mockPublications: PublicationData[] = [
          {
            title: "Multiple Sclerosis: Current Treatment Strategies",
            authors: ["Dr. Jane Smith", "Dr. John Doe"],
            journal: "Journal of Neurology",
            year: 2023,
            citations: 45,
            doi: "10.1000/example"
          },
          {
            title: "Neuroinflammation in Autoimmune Diseases",
            authors: ["Dr. Jane Smith", "Dr. Alice Johnson"],
            journal: "Nature Reviews Immunology",
            year: 2022,
            citations: 78,
            doi: "10.1001/example"
          }
        ]
        setPublications(mockPublications)
        setIsLoadingPublications(false)
      }, 1500)
    }

    fetchPublications()
  }, [formData.scopusId, formData.googleScholarUrl])

  // Check for potential overlaps with previous submissions
  useEffect(() => {
    if (formData.previousSubmissions) {
      const keywords = formData.previousSubmissions.toLowerCase()
      const overlapKeywords = ['multiple sclerosis', 'neuroinflammation', 'autoimmune']
      
      const hasOverlap = overlapKeywords.some(keyword => 
        keywords.includes(keyword)
      )
      
      if (hasOverlap) {
        setPreviousSubmissionWarning(
          '⚠️ Potential overlap detected with previous submissions. Please ensure this proposal represents new, distinct research.'
        )
      } else {
        setPreviousSubmissionWarning('')
      }
    } else {
      setPreviousSubmissionWarning('')
    }
  }, [formData.previousSubmissions])

  const validateScopusId = (scopusId: string) => {
    // Basic Scopus ID validation (numeric)
    const scopusRegex = /^\d+$/
    if (scopusId && !scopusRegex.test(scopusId)) {
      updateValidationErrors({ 
        scopusId: 'Scopus ID should contain only numbers' 
      })
    } else {
      updateValidationErrors({ scopusId: undefined })
    }
  }

  const validateGoogleScholarUrl = (url: string) => {
    const scholarRegex = /^https:\/\/scholar\.google\.com\/citations\?user=[\w-]+/
    if (url && !scholarRegex.test(url)) {
      updateValidationErrors({ 
        googleScholarUrl: 'Please enter a valid Google Scholar profile URL' 
      })
    } else {
      updateValidationErrors({ googleScholarUrl: undefined })
    }
  }

  return (
    <div className="form-section">
      <h2>Research Profile</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Help us understand your research background. This information is optional but 
        helps reviewers assess your expertise and may expedite the review process.
      </p>

      <div className="form-group">
        <label htmlFor="scopusId" className="form-label">
          Scopus Author ID
          <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
            (Optional - for automatic publication fetching)
          </span>
        </label>
        <input
          type="text"
          id="scopusId"
          className="form-input"
          value={formData.scopusId}
          onChange={(e) => {
            updateFormData({ scopusId: e.target.value })
            validateScopusId(e.target.value)
          }}
          placeholder="Enter your Scopus Author ID"
        />
        {validationErrors.scopusId && (
          <div className="form-error">{validationErrors.scopusId}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="googleScholarUrl" className="form-label">
          Google Scholar Profile URL
          <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
            (Optional - alternative to Scopus ID)
          </span>
        </label>
        <input
          type="url"
          id="googleScholarUrl"
          className="form-input"
          value={formData.googleScholarUrl}
          onChange={(e) => {
            updateFormData({ googleScholarUrl: e.target.value })
            validateGoogleScholarUrl(e.target.value)
          }}
          placeholder="https://scholar.google.com/citations?user=..."
        />
        {validationErrors.googleScholarUrl && (
          <div className="form-error">{validationErrors.googleScholarUrl}</div>
        )}
      </div>

      {/* Publications Display */}
      {isLoadingPublications && (
        <div className="ai-suggestion">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="spinner"></span>
            <span>Fetching your publications...</span>
          </div>
        </div>
      )}

      {publications.length > 0 && !isLoadingPublications && (
        <div className="ai-suggestion">
          <h4>Recent Publications Found</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {publications.map((pub, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                border: '1px solid var(--nmss-orange)', 
                borderRadius: '0.5rem', 
                marginBottom: '0.5rem',
                backgroundColor: 'var(--nmss-white)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {pub.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  {pub.authors.join(', ')} • {pub.journal} ({pub.year}) • {pub.citations} citations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="previousSubmissions" className="form-label">
          Previous NMSS Submissions
          <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
            (Optional - describe any previous submissions to avoid overlap)
          </span>
        </label>
        <textarea
          id="previousSubmissions"
          className="form-textarea"
          value={formData.previousSubmissions}
          onChange={(e) => updateFormData({ previousSubmissions: e.target.value })}
          placeholder="Describe any previous research proposals submitted to NMSS, including titles, years, and outcomes..."
          rows={4}
        />
        {previousSubmissionWarning && (
          <div className="validation-message warning">
            {previousSubmissionWarning}
          </div>
        )}
      </div>

      <div className="ai-suggestion">
        <h4>AI Research Insights</h4>
        <p>
          Based on your research profile, our AI system can help identify:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Research areas that align with NMSS priorities</li>
          <li>Potential collaboration opportunities</li>
          <li>Gaps in current research that your proposal might address</li>
          <li>Suggested keywords for your proposal</li>
        </ul>
      </div>
    </div>
  )
}

export default ResearchProfileSection
