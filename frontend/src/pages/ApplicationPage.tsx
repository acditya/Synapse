import { useState, useCallback, useMemo } from 'react'
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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
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
      'collaboration_opportunities': 'Strong potential for collaboration with existing NMSS-funded researchers and international MS research networks.',
      'ebv-prevention': 'Our longitudinal study will provide critical data for developing EBV vaccination strategies targeting high-risk populations. We will establish EBV seroconversion patterns and viral load thresholds that correlate with MS risk, enabling identification of individuals who would benefit most from EBV prevention strategies. Our findings will inform public health policies by providing evidence-based recommendations for EBV monitoring in MS prevention programs. Additionally, we anticipate identifying specific EBV proteins or genetic variants that could serve as targets for EBV-directed therapies in MS treatment.',
      'global-representation': 'We have established partnerships with 15 international MS research centers across North America, Europe, Asia, and Africa to ensure comprehensive global representation. Our recruitment strategy specifically targets regions with varying EBV prevalence rates (from 60% in developed countries to 95% in developing regions) to capture the full spectrum of EBV-MS relationships. We will include diverse genetic populations through collaborations with the International MS Genetics Consortium and will implement culturally sensitive recruitment strategies to include underrepresented populations in MS research.',
      'clinical-pathway': 'Our translational pathway includes three key phases: (1) Identification of EBV-MS biomarkers through longitudinal analysis, (2) Development of EBV-based diagnostic tools in collaboration with diagnostic companies, and (3) Clinical trials for EBV-targeted therapies. We have preliminary agreements with pharmaceutical partners for EBV vaccine development and will pursue FDA/EMA regulatory pathways for EBV prevention strategies. Our findings will directly inform MS treatment protocols by identifying patients who would benefit from EBV-directed interventions.',
      'mechanistic-insights': 'We expect to uncover specific molecular mechanisms of EBV-induced autoimmunity, including how EBV infection timing and viral load affect MS risk. Our study will identify novel biomarkers for EBV-related MS risk and develop innovative techniques for studying EBV-MS interactions using single-cell RNA sequencing and proteomic analysis. We anticipate discovering how EBV infection patterns in adolescence and young adulthood create a "window of vulnerability" for MS development.'
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

  const requiredAiQuestions = ['ebv-prevention', 'global-representation', 'clinical-pathway', 'mechanistic-insights']

  const validateStep = (step: number): boolean => {
    const errors: Partial<ValidationErrors> = {}
    
    switch (step) {
      case 1: // Applicant Information
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
        else if (formData.fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters'
        if (!formData.email.trim()) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address'
        }
        if (!formData.affiliation.trim()) errors.affiliation = 'Affiliation is required'
        else if (formData.affiliation.trim().length < 5) errors.affiliation = 'Affiliation should be more specific'
        if (!formData.hasPhD && !formData.hasMD) errors.qualifications = 'Select at least one qualification (PhD or MD)'
        if (formData.orcid.trim() && !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(formData.orcid.trim())) {
          errors.orcid = 'ORCID must be in the format 0000-0000-0000-0000'
        }
        break
        
      case 2: // Research Profile
        if (!formData.scopusId.trim() && !formData.googleScholarUrl.trim()) {
          errors.scopusId = 'Provide either a Scopus ID or Google Scholar URL'
          errors.googleScholarUrl = 'Provide either a Google Scholar URL or Scopus ID'
        }
        if (formData.scopusId.trim() && !/^\d{8,}$/.test(formData.scopusId.trim())) {
          errors.scopusId = 'Scopus ID must be numeric and at least 8 digits'
        }
        if (
          formData.googleScholarUrl.trim() &&
          !/^https:\/\/scholar\.google\.com\/citations\?user=[\w-]+/.test(formData.googleScholarUrl.trim())
        ) {
          errors.googleScholarUrl = 'Google Scholar URL must look like https://scholar.google.com/citations?user=...'
        }
        if (formData.previousSubmissions.trim().length < 30) {
          errors.previousSubmissions = 'Please add at least 30 characters about previous submissions'
        }
        if (formData.additionalProfileInfo.trim().length < 50) {
          errors.additionalProfileInfo = 'Please add at least 50 characters of profile context'
        }
        break
        
      case 3: // Proposal Submission
        if (!formData.proposalFile) errors.proposalFile = 'Research proposal file is required'
        else if (formData.proposalFile.size > 10 * 1024 * 1024) errors.proposalFile = 'Proposal file must be under 10MB'
        if (!formData.proposalTitle.trim()) errors.proposalTitle = 'Proposal title is required'
        else if (formData.proposalTitle.trim().length < 15) errors.proposalTitle = 'Proposal title must be at least 15 characters'
        if (!formData.abstract.trim()) errors.abstract = 'Abstract is required'
        else if (formData.abstract.trim().length < 250) errors.abstract = 'Abstract must be at least 250 characters'
        const keywordsCount = formData.keywords
          .split(',')
          .map(keyword => keyword.trim())
          .filter(Boolean).length
        if (keywordsCount < 3) errors.keywords = 'Please provide at least 3 keywords'
        break
        
      case 4: // Funding & Ethics
        if (!formData.fundingAmount.trim()) errors.fundingAmount = 'Funding amount is required'
        else {
          const fundingAmount = Number(formData.fundingAmount)
          if (Number.isNaN(fundingAmount) || fundingAmount <= 0) {
            errors.fundingAmount = 'Funding amount must be greater than zero'
          } else if (fundingAmount > 500000) {
            errors.fundingAmount = 'Funding cannot exceed AED 500,000 for this call'
          }
        }
        if (!formData.conflictOfInterest.trim()) errors.conflictOfInterest = 'Conflict of interest statement is required'
        else if (formData.conflictOfInterest.trim().length < 20) {
          errors.conflictOfInterest = 'Conflict of interest statement is too short'
        }
        if (!formData.ethicsDocuments) errors.ethicsDocuments = 'Ethics approval document is required'
        else if (formData.ethicsDocuments.size > 5 * 1024 * 1024) {
          errors.ethicsDocuments = 'Ethics file must be under 5MB'
        }
        break
      case 5: {
        const unanswered = requiredAiQuestions.filter((id) => !formData.aiResponses[id] || formData.aiResponses[id].trim().length < 80)
        if (unanswered.length > 0) {
          errors.aiResponses = 'Please provide complete responses for all high-priority AI clarification questions'
        }
        break
      }
      case 6:
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => {
        const next = new Set(prev)
        next.add(currentStep)
        return next
      })
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      setCurrentStep(5)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the data to your backend
      console.log('Submitting form data:', formData)
      
      setIsSubmitted(true)
      setCompletedSteps(new Set([1, 2, 3, 4, 5, 6]))
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

  const maxUnlockedStep = useMemo(() => {
    let unlocked = 1
    while (completedSteps.has(unlocked) && unlocked < totalSteps) {
      unlocked += 1
    }
    return unlocked
  }, [completedSteps, totalSteps])

  const handleStepClick = (step: number) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          completedSteps={completedSteps}
          maxUnlockedStep={maxUnlockedStep}
          onStepClick={handleStepClick}
        />
        
        {renderCurrentStep()}

        {validationErrors.aiResponses && currentStep === 5 && (
          <div className="validation-message error">{validationErrors.aiResponses}</div>
        )}
        
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
            
            {currentStep < totalSteps ? (
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
