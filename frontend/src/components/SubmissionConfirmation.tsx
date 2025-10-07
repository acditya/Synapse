import { useState } from 'react'
import type { FormData } from '../types/formTypes'

interface SubmissionConfirmationProps {
  formData: FormData
  onSubmit: () => void
  isSubmitting: boolean
}

const SubmissionConfirmation = ({
  formData,
  onSubmit,
  isSubmitting
}: SubmissionConfirmationProps) => {
  const [hasConfirmed, setHasConfirmed] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="form-section">
      <h2>Review & Submit Application</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Please review all information before submitting. You will receive a confirmation 
        email with your application ID upon successful submission.
      </p>

      {/* Application Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
          Application Summary
        </h3>
        
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
            Applicant Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <strong>Name:</strong> {formData.fullName}
            </div>
            <div>
              <strong>Email:</strong> {formData.email}
            </div>
            <div>
              <strong>Affiliation:</strong> {formData.affiliation}
            </div>
            <div>
              <strong>ORCID:</strong> {formData.orcid || 'Not provided'}
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
            Research Proposal
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Title:</strong> {formData.proposalTitle}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>File:</strong> {formData.proposalFile ? 
              `${formData.proposalFile.name} (${formatFileSize(formData.proposalFile.size)})` : 
              'No file uploaded'
            }
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Abstract:</strong>
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '1rem', 
              backgroundColor: 'var(--light-gray)', 
              borderRadius: '0.5rem',
              fontStyle: 'italic'
            }}>
              {formData.abstract}
            </div>
          </div>
          {formData.keywords && (
            <div>
              <strong>Keywords:</strong> {formData.keywords}
            </div>
          )}
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
            Funding & Ethics
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Requested Amount:</strong> {formatCurrency(formData.fundingAmount)}
            </div>
            <div>
              <strong>Ethics Documents:</strong> {formData.ethicsDocuments ? 
                `${formData.ethicsDocuments.name} (${formatFileSize(formData.ethicsDocuments.size)})` : 
                'Not provided'
              }
            </div>
          </div>
          {formData.conflictOfInterest && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Conflict of Interest:</strong>
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '1rem', 
                backgroundColor: 'var(--light-gray)', 
                borderRadius: '0.5rem'
              }}>
                {formData.conflictOfInterest}
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Responses */}
        {Object.keys(formData.aiResponses).length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: '1rem', color: 'var(--light-sea-green)' }}>
              AI Clarification Responses
            </h4>
            {Object.entries(formData.aiResponses).map(([questionId, response]) => (
              <div key={questionId} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--light-gray)', borderRadius: '0.5rem' }}>
                <strong>Question {questionId}:</strong>
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                  {response}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Insights Summary */}
        {formData.researchPriorities.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: '1rem', color: 'var(--light-sea-green)' }}>
              AI Analysis Results
            </h4>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Research Priority Alignment:</strong>
              <div className="priority-badges">
                {formData.researchPriorities.map((priority: string, index: number) => (
                  <span key={index} className="badge badge-primary">
                    {priority}
                  </span>
                ))}
              </div>
            </div>
            {formData.autoKeywords.length > 0 && (
              <div>
                <strong>AI-Suggested Keywords:</strong>
                <div className="priority-badges">
                  {formData.autoKeywords.map((keyword: string, index: number) => (
                    <span key={index} className="badge badge-secondary">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="card" style={{ backgroundColor: 'rgba(32, 178, 170, 0.05)', border: '1px solid var(--light-sea-green)' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
          Terms and Conditions
        </h4>
        <div style={{ marginBottom: '1rem' }}>
          <p>
            By submitting this application, you agree to the following terms:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>All information provided is accurate and complete</li>
            <li>You have the right to submit this research proposal</li>
            <li>You will comply with all NMSS research guidelines and ethical standards</li>
            <li>You understand that this application will be reviewed by independent experts</li>
            <li>You consent to the use of AI tools to assist in the review process</li>
          </ul>
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(e) => setHasConfirmed(e.target.checked)}
            style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
          />
          <span>
            I have read and agree to the terms and conditions above
          </span>
        </label>
      </div>

      {/* Submission Button */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!hasConfirmed || isSubmitting}
          style={{ 
            fontSize: '1.125rem', 
            padding: '1rem 2rem',
            opacity: !hasConfirmed ? 0.6 : 1
          }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
        
        {!hasConfirmed && (
          <p style={{ marginTop: '1rem', color: 'var(--error-red)', fontSize: '0.875rem' }}>
            Please confirm the terms and conditions to submit your application
          </p>
        )}
      </div>

      {/* Final AI Insights */}
      <div className="ai-suggestion">
        <h4>🎯 Final AI Assessment</h4>
        <p>
          Your application appears complete and well-aligned with NMSS research priorities. 
          The AI analysis suggests strong potential for funding consideration. 
          Good luck with your submission!
        </p>
      </div>
    </div>
  )
}

export default SubmissionConfirmation
