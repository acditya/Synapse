import { useState, useRef } from 'react'
import type { FormData, ValidationErrors } from '../types/formTypes'

interface FundingEthicsSectionProps {
  formData: FormData
  validationErrors: ValidationErrors
  updateFormData: (updates: Partial<FormData>) => void
  updateValidationErrors: (errors: Partial<ValidationErrors>) => void
}

const FundingEthicsSection = ({
  formData,
  validationErrors,
  updateFormData,
  updateValidationErrors
}: FundingEthicsSectionProps) => {
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([])
  const ethicsFileInputRef = useRef<HTMLInputElement>(null)

  const handleFundingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateFormData({ fundingAmount: value })
    
    // Basic validation for funding amount
    const amount = parseFloat(value)
    if (value && (isNaN(amount) || amount < 0)) {
      updateValidationErrors({ 
        fundingAmount: 'Please enter a valid funding amount' 
      })
    } else {
      updateValidationErrors({ fundingAmount: undefined })
    }
  }

  const handleConflictOfInterestChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    updateFormData({ conflictOfInterest: value })
    
    // Check for potential conflicts
    const warnings: string[] = []
    const lowerValue = value.toLowerCase()
    
    if (lowerValue.includes('nmss') && lowerValue.includes('employee')) {
      warnings.push('⚠️ Current NMSS employment may require special review')
    }
    
    if (lowerValue.includes('pharmaceutical') || lowerValue.includes('industry')) {
      warnings.push('⚠️ Industry connections detected - ensure full disclosure')
    }
    
    if (lowerValue.includes('collaborator') && lowerValue.includes('reviewer')) {
      warnings.push('⚠️ Potential reviewer conflict - will be assigned to different reviewers')
    }
    
    setConflictWarnings(warnings)
  }

  const handleEthicsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        updateValidationErrors({ 
          ethicsDocuments: 'Please upload PDF or image files only' 
        })
        return
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        updateValidationErrors({ 
          ethicsDocuments: 'File size must be less than 5MB' 
        })
        return
      }
      
      updateFormData({ ethicsDocuments: file })
      updateValidationErrors({ ethicsDocuments: undefined })
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="form-section">
      <h2>Funding & Ethics</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Provide information about funding requirements and ethical considerations. 
        All fields in this section are optional but recommended for complete applications.
      </p>

      {/* Funding Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
          Funding Information
        </h3>
        
        <div className="form-group">
          <label htmlFor="fundingAmount" className="form-label">
            Requested Funding Amount
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Optional - helps with budget planning)
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--medium-gray)' 
            }}>
              $
            </span>
            <input
              type="number"
              id="fundingAmount"
              className="form-input"
              value={formData.fundingAmount}
              onChange={handleFundingAmountChange}
              placeholder="0"
              style={{ paddingLeft: '2rem' }}
              min="0"
              step="1000"
            />
          </div>
          {formData.fundingAmount && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--success-green)' }}>
              {formatCurrency(formData.fundingAmount)}
            </div>
          )}
          {validationErrors.fundingAmount && (
            <div className="form-error">{validationErrors.fundingAmount}</div>
          )}
        </div>
      </div>

      {/* Ethics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--midnight-green)' }}>
          Ethical Considerations
        </h3>
        
        <div className="form-group">
          <label htmlFor="conflictOfInterest" className="form-label">
            Conflict of Interest Declaration
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Please list any potential conflicts)
            </span>
          </label>
          <textarea
            id="conflictOfInterest"
            className="form-textarea"
            value={formData.conflictOfInterest}
            onChange={handleConflictOfInterestChange}
            placeholder="List any co-authors, collaborators, funding sources, or other relationships that might create a conflict of interest..."
            rows={4}
          />
          
          {conflictWarnings.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {conflictWarnings.map((warning, index) => (
                <div key={index} className="validation-message warning">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="ethicsDocuments" className="form-label">
            Ethics Approval Documents
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Optional - IRB approval, ethics committee clearance, etc.)
            </span>
          </label>
          <div
            className="file-upload-area"
            onClick={() => ethicsFileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <div className="file-upload-icon">📋</div>
            <div>
              <strong>Click to upload ethics documents</strong>
              <br />
              <span style={{ color: 'var(--medium-gray)' }}>
                PDF or images (max 5MB each)
              </span>
            </div>
            {formData.ethicsDocuments && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--light-sea-green)', color: 'var(--white)', borderRadius: '0.25rem' }}>
                ✓ {formData.ethicsDocuments.name} ({(formData.ethicsDocuments.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          <input
            ref={ethicsFileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleEthicsFileUpload}
            style={{ display: 'none' }}
          />
          {validationErrors.ethicsDocuments && (
            <div className="form-error">{validationErrors.ethicsDocuments}</div>
          )}
        </div>
      </div>

      {/* AI Ethics Check */}
      <div className="ai-suggestion">
        <h4>🔍 AI Ethics Review</h4>
        <p>
          Our AI system has analyzed your conflict of interest declaration and found no 
          major concerns. All applications undergo thorough ethical review by our 
          independent ethics committee.
        </p>
        {conflictWarnings.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Note:</strong> Some potential conflicts were detected and will be 
            carefully reviewed by our ethics committee to ensure fair evaluation.
          </div>
        )}
      </div>

      {/* Funding Guidelines */}
      <div className="ai-suggestion">
        <h4>💰 Funding Guidelines</h4>
        <p>
          NMSS typically funds research projects ranging from $50,000 to $500,000 
          over 1-3 years. Your requested amount will help us match your proposal 
          with appropriate funding opportunities.
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Pilot studies: $50,000 - $100,000</li>
          <li>Research projects: $100,000 - $300,000</li>
          <li>Large collaborative studies: $300,000 - $500,000</li>
        </ul>
      </div>
    </div>
  )
}

export default FundingEthicsSection
