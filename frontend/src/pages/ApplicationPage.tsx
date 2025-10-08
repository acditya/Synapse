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
    // Applicant Information - Alberto Ascherio's data
    fullName: 'Alberto Ascherio',
    email: 'alberto.ascherio@hsph.harvard.edu',
    affiliation: 'Professor of Epidemiology and Nutrition, Harvard University',
    orcid: '0000-0002-1234-5678',
    hasPhD: true,
    hasMD: false,
    
    // Research Profile
    scopusId: '7004212771',
    googleScholarUrl: 'https://scholar.google.com/citations?user=ascherio_profile',
    previousSubmissions: 'Previous research on vitamin D and multiple sclerosis risk, Parkinson\'s disease epidemiology, and cardiovascular disease prevention through nutrition.',
    additionalProfileInfo: 'Recipient of the 2022 International Multiple Sclerosis Society Research Award for groundbreaking work on EBV-MS relationship. Director of the Harvard Neuroepidemiology Research Group. Principal Investigator on multiple NIH-funded longitudinal studies. Member of the World Health Organization Expert Panel on Neurological Disorders. Co-founder of the International MS Genetics Consortium. Published over 400 peer-reviewed articles with focus on environmental and genetic factors in neurological diseases.',
    
    // Proposal Submission
    proposalFile: new File([''], 'EBV_MS_Longitudinal_Study_Proposal.pdf', { type: 'application/pdf' }),
    proposalTitle: 'Longitudinal Analysis of Epstein-Barr Virus and Multiple Sclerosis Risk: A Population-Based Cohort Study',
    abstract: 'This study aims to investigate the longitudinal relationship between Epstein-Barr virus (EBV) infection and multiple sclerosis (MS) risk using a large population-based cohort. Building on our recent findings published in Science (2022) showing a strong association between EBV and MS, we propose to extend this research with a comprehensive longitudinal analysis of 50,000+ participants over 10 years. Our study will examine EBV seroconversion patterns, viral load dynamics, and their relationship to MS development, while controlling for genetic and environmental factors. This research has the potential to revolutionize our understanding of MS etiology and inform novel prevention strategies.',
    keywords: 'Epstein-Barr virus, Multiple sclerosis, Longitudinal study, Epidemiology, Neuroinflammation, Autoimmune disease, Population-based cohort',
    
    // Funding & Ethics
    fundingAmount: '500000',
    conflictOfInterest: 'No conflicts of interest. All authors have no financial relationships with pharmaceutical companies or other entities that could influence this research.',
    ethicsDocuments: new File([''], 'Harvard_IRB_Approval_EBV_MS_Longitudinal_Study_2024.pdf', { type: 'application/pdf' }),
    
    // AI-generated data
    aiSummary: 'Dr. Ascherio is a world-renowned epidemiologist with 189,679 citations and an h-index of 170. His research focuses on the epidemiology of neurological diseases, particularly multiple sclerosis and Parkinson\'s disease. He has published extensively on vitamin D, Epstein-Barr virus, and environmental factors in MS. His recent Science publication on EBV and MS has been cited over 2,000 times.',
    researchPriorities: ['Multiple Sclerosis', 'Epstein-Barr Virus', 'Epidemiology', 'Neuroinflammation', 'Environmental Factors'],
    autoKeywords: ['Epstein-Barr virus', 'Multiple sclerosis', 'Longitudinal study', 'Epidemiology', 'Neuroinflammation', 'Autoimmune disease', 'Population-based cohort', 'Vitamin D', 'Environmental factors'],
    
    // AI Analysis responses
    aiResponses: {
      'research_expertise': 'Dr. Ascherio demonstrates exceptional expertise in MS epidemiology with 170 h-index and extensive publication record in top-tier journals including Science, Nature, and NEJM.',
      'methodology_strength': 'Proposed longitudinal cohort study design is methodologically sound and builds on established epidemiological principles. Sample size of 50,000+ provides adequate statistical power.',
      'innovation_potential': 'This research addresses a critical gap in understanding EBV-MS relationship and has potential to identify novel prevention strategies.',
      'nmss_alignment': 'Highly aligned with NMSS research priorities focusing on MS etiology, prevention, and environmental factors.',
      'collaboration_opportunities': 'Strong potential for collaboration with existing NMSS-funded researchers and international MS research networks.'
    }
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
