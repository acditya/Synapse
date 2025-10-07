import { useState, useCallback } from 'react'
import HeroSection from '../components/HeroSection'
import ApplicantInfoSection from '../components/ApplicantInfoSection'
import ResearchProfileSection from '../components/ResearchProfileSection'
import ProposalSubmissionSection from '../components/ProposalSubmissionSection'
import FundingEthicsSection from '../components/FundingEthicsSection'
import AIAnalysisSection from '../components/AIAnalysisSection'
import SubmissionConfirmation from '../components/SubmissionConfirmation'
import ProgressIndicator from '../components/ProgressIndicator'
import type { FormData, ValidationErrors } from '../types/formTypes'

const ApplicationPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    // Applicant Information
    fullName: '',
    email: '',
    affiliation: '',
    orcid: '',
    
    // Research Profile
    scopusId: '',
    googleScholarUrl: '',
    previousSubmissions: '',
    
    // Proposal Submission
    proposalFile: null,
    proposalTitle: '',
    abstract: '',
    keywords: '',
    
    // Funding & Ethics
    fundingAmount: '',
    conflictOfInterest: '',
    ethicsDocuments: null,
    
    // AI-generated data
    aiSummary: '',
    researchPriorities: [],
    autoKeywords: [],
    
    // AI Analysis responses
    aiResponses: {}
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const totalSteps = 6

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const updateValidationErrors = useCallback((errors: Partial<ValidationErrors>) => {
    setValidationErrors(prev => ({ ...prev, ...errors }))
  }, [])

  const validateStep = (step: number): boolean => {
    const errors: Partial<ValidationErrors> = {}
    
    switch (step) {
      case 1: // Applicant Information
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
        if (!formData.email.trim()) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address'
        }
        if (!formData.affiliation.trim()) errors.affiliation = 'Affiliation is required'
        break
        
      case 2: // Research Profile
        // Optional fields, no validation required
        break
        
      case 3: // Proposal Submission
        if (!formData.proposalFile) errors.proposalFile = 'Research proposal file is required'
        if (!formData.proposalTitle.trim()) errors.proposalTitle = 'Proposal title is required'
        if (!formData.abstract.trim()) errors.abstract = 'Abstract is required'
        break
        
      case 4: // Funding & Ethics
        // Optional fields, no validation required
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the data to your backend
      console.log('Submitting form data:', formData)
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      // Handle error state
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ApplicantInfoSection
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
            updateValidationErrors={updateValidationErrors}
          />
        )
      case 2:
        return (
          <ResearchProfileSection
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
            updateValidationErrors={updateValidationErrors}
          />
        )
      case 3:
        return (
          <ProposalSubmissionSection
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
            updateValidationErrors={updateValidationErrors}
          />
        )
      case 4:
        return (
          <FundingEthicsSection
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
            updateValidationErrors={updateValidationErrors}
          />
        )
      case 5:
        return (
          <AIAnalysisSection
            formData={formData}
            validationErrors={validationErrors}
            updateFormData={updateFormData}
            updateValidationErrors={updateValidationErrors}
          />
        )
      case 6:
        return (
          <SubmissionConfirmation
            formData={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <div className="container">
        <div className="submission-confirmation">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="/National-MS-Society-1024x1024.avif" 
              alt="National Multiple Sclerosis Society Logo" 
              style={{ 
                height: '60px', 
                width: 'auto',
                marginRight: '1rem'
              }}
            />
          </div>
          <div className="success-icon">✓</div>
          <h2>Application Submitted Successfully!</h2>
          <p>Thank you for submitting your research proposal to NMSS. You will receive a confirmation email shortly.</p>
          <p>Your application ID is: <strong>NMSS-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <HeroSection />
      
      <div className="container">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepClick={setCurrentStep}
        />
        
        {renderCurrentStep()}
        
        {currentStep < 6 && (
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        )}
      </div>
      
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Submitting your application...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationPage
