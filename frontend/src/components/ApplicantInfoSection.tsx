import { useState } from 'react'
import type { FormData, ValidationErrors } from '../types/formTypes'

interface ApplicantInfoSectionProps {
  formData: FormData
  validationErrors: ValidationErrors
  updateFormData: (updates: Partial<FormData>) => void
  updateValidationErrors: (errors: Partial<ValidationErrors>) => void
}

const ApplicantInfoSection = ({
  formData,
  validationErrors,
  updateFormData,
  updateValidationErrors
}: ApplicantInfoSectionProps) => {
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean
    message: string
  }>({ isValid: true, message: '' })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const institutionalRegex = /\.(edu|gov|org)$/
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' }
    }
    
    if (!institutionalRegex.test(email)) {
      return { 
        isValid: true, 
        message: 'Institutional email preferred for verification' 
      }
    }
    
    return { isValid: true, message: 'Valid institutional email' }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    updateFormData({ email })
    
    const validation = validateEmail(email)
    setEmailValidation(validation)
    
    if (validation.isValid) {
      updateValidationErrors({ email: undefined })
    } else {
      updateValidationErrors({ email: validation.message })
    }
  }

  const handleOrcidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orcid = e.target.value
    updateFormData({ orcid })
    
    // Basic ORCID validation (format: 0000-0000-0000-0000)
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/
    if (orcid && !orcidRegex.test(orcid)) {
      updateValidationErrors({ 
        orcid: 'ORCID should be in format: 0000-0000-0000-0000' 
      })
    } else {
      updateValidationErrors({ orcid: undefined })
    }
  }

  return (
    <div className="form-section">
      <h2>Applicant Information</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Please provide your personal and professional information. All fields marked with * are required.
      </p>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          className="form-input"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          placeholder="Enter your full name"
          required
        />
        {validationErrors.fullName && (
          <div className="form-error">{validationErrors.fullName}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          className="form-input"
          value={formData.email}
          onChange={handleEmailChange}
          placeholder="your.email@institution.edu"
          required
        />
        {validationErrors.email && (
          <div className="form-error">{validationErrors.email}</div>
        )}
        {emailValidation.message && !validationErrors.email && (
          <div className={`validation-message ${
            emailValidation.isValid ? 'success' : 'warning'
          }`}>
            {emailValidation.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="affiliation" className="form-label">
          Affiliation / Institution *
        </label>
        <input
          type="text"
          id="affiliation"
          className="form-input"
          value={formData.affiliation}
          onChange={(e) => updateFormData({ affiliation: e.target.value })}
          placeholder="University, Hospital, Research Institute, etc."
          required
        />
        {validationErrors.affiliation && (
          <div className="form-error">{validationErrors.affiliation}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="orcid" className="form-label">
          ORCID / Researcher ID
          <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
            (Optional - helps with verification)
          </span>
        </label>
        <input
          type="text"
          id="orcid"
          className="form-input"
          value={formData.orcid}
          onChange={handleOrcidChange}
          placeholder="0000-0000-0000-0000"
        />
        {validationErrors.orcid && (
          <div className="form-error">{validationErrors.orcid}</div>
        )}
        {formData.orcid && !validationErrors.orcid && (
          <div className="validation-message success">
            Valid ORCID format
          </div>
        )}
      </div>

      <div className="ai-suggestion">
        <h4>AI Insight</h4>
        <p>
          Providing your ORCID helps us automatically verify your research background 
          and may speed up the review process. Your ORCID profile will be used to 
          fetch your publication history and research expertise.
        </p>
      </div>
    </div>
  )
}

export default ApplicantInfoSection
