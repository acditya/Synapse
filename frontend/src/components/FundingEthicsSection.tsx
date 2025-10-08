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
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
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
            <img 
              src="/UAE_Dirham_Symbol.svg.png" 
              alt="AED" 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '16px',
                height: '16px'
              }}
            />
            <input
              type="number"
              id="fundingAmount"
              className="form-input"
              value={formData.fundingAmount}
              onChange={handleFundingAmountChange}
              placeholder="0"
              style={{ paddingLeft: '2.5rem' }}
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
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: 'rgba(0, 123, 191, 0.1)', 
                border: '2px solid var(--light-sea-green)', 
                borderRadius: '0.5rem',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    background: 'var(--light-sea-green)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    📋
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)', marginBottom: '0.25rem' }}>
                      ✓ {formData.ethicsDocuments.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                      Harvard IRB Approval • Protocol #2024-001234 • 1.2 MB • Uploaded Successfully
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--success-green)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    APPROVED
                  </div>
                </div>
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
      <div className="ai-suggestion demo-highlight">
        <div className="demo-badge">Ethics Review Complete</div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--light-sea-green)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          AI Ethics Review
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ Scientific Merit
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Methodologically sound
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ Risk-Benefit Analysis
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Risks justified by benefits
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ Informed Consent
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Comprehensive procedures
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ Data Protection
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Privacy safeguards in place
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ IRB Approval
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Harvard IRB approved
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(0, 123, 191, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid var(--light-sea-green)'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--light-sea-green)', marginBottom: '0.5rem' }}>
              ✓ Vulnerable Populations
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
              Special protections included
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'rgba(255, 107, 53, 0.05)', 
          border: '1px solid var(--nmss-orange)', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h5 style={{ color: 'var(--nmss-orange)', marginBottom: '0.75rem' }}>Ethics Evaluation Summary</h5>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Our AI system has conducted a comprehensive ethics review based on current medical research standards. 
            The research protocol has been evaluated across six key ethical dimensions:
          </p>
          <ul style={{ marginLeft: '1.5rem', fontSize: '0.875rem' }}>
            <li><strong>Scientific Merit:</strong> Independent committee review confirms methodological soundness</li>
            <li><strong>Risk-Benefit Analysis:</strong> Potential risks are minimized and justified by anticipated benefits</li>
            <li><strong>Informed Consent:</strong> Comprehensive procedures ensure voluntary, informed participation</li>
            <li><strong>Data Protection:</strong> Strict confidentiality and privacy protocols established</li>
            <li><strong>Vulnerable Populations:</strong> Special safeguards protect at-risk groups</li>
            <li><strong>Institutional Oversight:</strong> Harvard IRB approval confirms ethical compliance</li>
          </ul>
        </div>
        
        {conflictWarnings.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Note:</strong> Some potential conflicts were detected and will be 
            carefully reviewed by our ethics committee to ensure fair evaluation.
          </div>
        )}
      </div>

      {/* Funding Guidelines */}
      <div className="ai-suggestion">
        <h4>💰 NMSS Funding Guidelines</h4>
        <p>
          NMSS research grants support projects for 1 year with potential continuation up to 3 years. 
          Maximum funding is AED 500,000 per year, subject to progress reports and fund availability.
        </p>
        <div style={{ 
          backgroundColor: 'rgba(255, 107, 53, 0.05)', 
          border: '1px solid var(--nmss-orange)', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h5 style={{ color: 'var(--nmss-orange)', marginBottom: '0.75rem' }}>Funding Structure</h5>
          <ul style={{ marginLeft: '1.5rem', fontSize: '0.875rem' }}>
            <li><strong>Maximum per year:</strong> AED 500,000</li>
            <li><strong>Duration:</strong> 1 year (renewable up to 3 years)</li>
            <li><strong>Renewal:</strong> Based on progress reports and fund availability</li>
            <li><strong>International collaboration:</strong> Max 50% of budget to international partners</li>
          </ul>
        </div>
        <div style={{ 
          backgroundColor: 'rgba(220, 53, 69, 0.05)', 
          border: '1px solid #DC3545', 
          borderRadius: '0.5rem', 
          padding: '1rem'
        }}>
          <h5 style={{ color: '#DC3545', marginBottom: '0.75rem' }}>Disallowed Expenses</h5>
          <ul style={{ marginLeft: '1.5rem', fontSize: '0.875rem' }}>
            <li>Facilities and administrative (F&A) costs</li>
            <li>Construction or renovation costs</li>
            <li>Tuition or membership dues</li>
            <li>Publication fees over AED 12,000/year (must be justified)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FundingEthicsSection
