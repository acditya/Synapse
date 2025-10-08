import { useState, useEffect } from 'react'
import type { FormData, ValidationErrors } from '../types/formTypes'

interface AIAnalysisSectionProps {
  formData: FormData
  validationErrors: ValidationErrors
  updateFormData: (updates: Partial<FormData>) => void
  updateValidationErrors: (errors: Partial<ValidationErrors>) => void
}

interface AIQuestion {
  id: string
  question: string
  category: 'alignment' | 'methodology' | 'impact' | 'feasibility' | 'innovation'
  priority: 'high' | 'medium' | 'low'
  context: string
  suggestions: string[]
}

const AIAnalysisSection = ({
  formData,
  updateFormData
}: AIAnalysisSectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisResults, setAnalysisResults] = useState<{
    overallScore: number
    strengths: string[]
    areasForImprovement: string[]
    nmssAlignment: string[]
    questions: AIQuestion[]
  }>({
    overallScore: 0,
    strengths: [],
    areasForImprovement: [],
    nmssAlignment: [],
    questions: []
  })
  const [userResponses, setUserResponses] = useState<Record<string, string>>({
    'ebv-prevention': 'Our longitudinal study will provide critical data for developing EBV vaccination strategies targeting high-risk populations. We will establish EBV seroconversion patterns and viral load thresholds that correlate with MS risk, enabling identification of individuals who would benefit most from EBV prevention strategies. Our findings will inform public health policies by providing evidence-based recommendations for EBV monitoring in MS prevention programs. Additionally, we anticipate identifying specific EBV proteins or genetic variants that could serve as targets for EBV-directed therapies in MS treatment.',
    'global-representation': 'We have established partnerships with 15 international MS research centers across North America, Europe, Asia, and Africa to ensure comprehensive global representation. Our recruitment strategy specifically targets regions with varying EBV prevalence rates (from 60% in developed countries to 95% in developing regions) to capture the full spectrum of EBV-MS relationships. We will include diverse genetic populations through collaborations with the International MS Genetics Consortium and will implement culturally sensitive recruitment strategies to include underrepresented populations in MS research.',
    'clinical-pathway': 'Our translational pathway includes three key phases: (1) Identification of EBV-MS biomarkers through longitudinal analysis, (2) Development of EBV-based diagnostic tools in collaboration with diagnostic companies, and (3) Clinical trials for EBV-targeted therapies. We have preliminary agreements with pharmaceutical partners for EBV vaccine development and will pursue FDA/EMA regulatory pathways for EBV prevention strategies. Our findings will directly inform MS treatment protocols by identifying patients who would benefit from EBV-directed interventions.',
    'mechanistic-insights': 'We expect to uncover specific molecular mechanisms of EBV-induced autoimmunity, including how EBV infection timing and viral load affect MS risk. Our study will identify novel biomarkers for EBV-related MS risk and develop innovative techniques for studying EBV-MS interactions using single-cell RNA sequencing and proteomic analysis. We anticipate discovering how EBV infection patterns in adolescence and young adulthood create a "window of vulnerability" for MS development.'
  })
  const [showAllQuestions, setShowAllQuestions] = useState(false)

  // Simulate AI analysis
  useEffect(() => {
    const analyzeProposal = async () => {
      setIsAnalyzing(true)
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock AI analysis results
      const mockAnalysis = {
        overallScore: 94,
        strengths: [
          "Exceptional research expertise with 170 h-index and 189,679 citations",
          "Pioneering work on EBV-MS relationship published in Science (2022)",
          "Extensive experience in MS epidemiology and environmental factors",
          "Strong publication record in top-tier journals (Science, Nature, NEJM, JAMA)",
          "Clear translational potential with established research network",
          "Methodologically sound longitudinal cohort design"
        ],
        areasForImprovement: [
          "Consider including patient engagement strategies",
          "Could expand on community outreach initiatives"
        ],
        nmssAlignment: [
          "Advancing Innovative MS Treatments",
          "MS Epidemiology in UAE",
          "Genetic Factors in MS",
          "MS Risk Factors in UAE Population",
          "Treatment Efficacy in UAE Populations"
        ],
        questions: [
          {
            id: "ebv-prevention",
            question: "How will your EBV-MS findings translate into practical prevention strategies for MS?",
            category: "impact" as const,
            priority: "high" as const,
            context: "Given your groundbreaking Science publication showing EBV as a necessary cause of MS, NMSS is particularly interested in how this research will lead to actionable prevention strategies.",
            suggestions: [
              "Describe potential EBV vaccination strategies for MS prevention",
              "Explain how EBV monitoring could identify high-risk individuals",
              "Detail how findings could inform public health policies for MS prevention",
              "Mention potential for EBV-targeted therapies in MS treatment"
            ]
          },
          {
            id: "global-representation",
            question: "How will you ensure global representation in your 50,000+ participant cohort, especially from regions with varying EBV prevalence?",
            category: "methodology" as const,
            priority: "high" as const,
            context: "EBV prevalence varies significantly across populations and geographic regions. NMSS values research that captures this global diversity to understand MS etiology comprehensively.",
            suggestions: [
              "Describe recruitment from high and low EBV prevalence regions",
              "Explain how you'll account for genetic diversity in EBV-MS relationships",
              "Detail partnerships with international MS research centers",
              "Mention strategies for including underrepresented populations in MS research"
            ]
          },
          {
            id: "clinical-pathway",
            question: "What is your specific pathway from identifying EBV-MS mechanisms to developing clinical interventions?",
            category: "feasibility" as const,
            priority: "high" as const,
            context: "NMSS seeks clear translational pathways from basic research to clinical applications, especially for a researcher of your caliber with established industry connections.",
            suggestions: [
              "Outline specific milestones for EBV-based diagnostic tools",
              "Describe potential partnerships with pharmaceutical companies for EBV-targeted therapies",
              "Explain regulatory pathways for EBV prevention strategies",
              "Detail how findings could inform MS treatment protocols"
            ]
          },
          {
            id: "mechanistic-insights",
            question: "What specific mechanistic insights do you expect to uncover about EBV's role in MS pathogenesis?",
            category: "innovation" as const,
            priority: "high" as const,
            context: "Your previous work established EBV as necessary for MS. NMSS is interested in understanding the specific mechanisms by which EBV triggers MS development.",
            suggestions: [
              "Describe molecular mechanisms of EBV-induced autoimmunity",
              "Explain how EBV infection timing affects MS risk",
              "Detail potential biomarkers for EBV-related MS risk",
              "Mention novel techniques for studying EBV-MS interactions"
            ]
          }
        ]
      }
      
      setAnalysisResults(mockAnalysis)
      setIsAnalyzing(false)
    }

    analyzeProposal()
  }, [])

  const handleResponseChange = (questionId: string, response: string) => {
    setUserResponses(prev => ({
      ...prev,
      [questionId]: response
    }))
    
    // Also update the form data
    updateFormData({
      aiResponses: {
        ...formData.aiResponses,
        [questionId]: response
      }
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'alignment': return 'badge-primary'
      case 'methodology': return 'badge-secondary'
      case 'impact': return 'badge-warning'
      case 'feasibility': return 'badge-primary'
      case 'innovation': return 'badge-secondary'
      default: return 'badge-primary'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': 
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#DC3545',
            display: 'inline-block'
          }}></div>
        )
      case 'medium': 
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#FFC107',
            display: 'inline-block'
          }}></div>
        )
      case 'low': 
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#28A745',
            display: 'inline-block'
          }}></div>
        )
      default: 
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#6C757D',
            display: 'inline-block'
          }}></div>
        )
    }
  }

  const displayedQuestions = showAllQuestions 
    ? analysisResults.questions 
    : analysisResults.questions.filter(q => q.priority === 'high')

  if (isAnalyzing) {
    return (
      <div className="form-section">
        <h2>AI Analysis & Clarification</h2>
        <div className="ai-suggestion" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span className="spinner" style={{ width: '2rem', height: '2rem' }}></span>
            <h3 style={{ margin: 0, color: 'var(--light-sea-green)' }}>AI is analyzing your proposal...</h3>
          </div>
          <p style={{ color: 'var(--medium-gray)' }}>
            Our AI is reviewing your application against NMSS research priorities and 
            identifying areas for clarification to strengthen your proposal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-section">
      <h2>AI Analysis & Clarification</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--medium-gray)' }}>
        Our AI has analyzed your proposal and identified key areas for clarification. 
        Please address these questions to strengthen your application's alignment with NMSS priorities.
      </p>

      {/* Analysis Summary */}
      <div className="card demo-highlight" style={{ backgroundColor: 'rgba(255, 107, 53, 0.05)', border: '1px solid var(--nmss-orange)' }}>
        <div className="demo-badge">AI Analysis Complete</div>
        <h3 style={{ color: 'var(--nmss-orange)', marginBottom: '1rem' }}>
          AI Analysis Summary
        </h3>
        
        <div className="demo-stats" style={{ marginBottom: '1.5rem' }}>
          <div className="demo-stat-item">
            <span className="demo-stat-number">{analysisResults.overallScore}/100</span>
            <span className="demo-stat-label">Overall Score</span>
          </div>
          <div className="demo-stat-item">
            <span className="demo-stat-number">{analysisResults.strengths.length}</span>
            <span className="demo-stat-label">Key Strengths</span>
          </div>
          <div className="demo-stat-item">
            <span className="demo-stat-number">{analysisResults.nmssAlignment.length}</span>
            <span className="demo-stat-label">NMSS Alignments</span>
          </div>
          <div className="demo-stat-item">
            <span className="demo-stat-number">{analysisResults.questions.filter(q => q.priority === 'high').length}</span>
            <span className="demo-stat-label">High Priority Questions</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <strong>NMSS Research Priorities Alignment:</strong>
          <div className="priority-badges" style={{ marginTop: '0.5rem' }}>
            {analysisResults.nmssAlignment.map((priority, index) => (
              <span key={index} className="badge badge-primary" style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                {priority}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--success-green)', marginBottom: '0.5rem' }}>✓ Strengths</h4>
            <ul style={{ marginLeft: '1rem' }}>
              {analysisResults.strengths.map((strength, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--warning-orange)', marginBottom: '0.5rem' }}>⚠ Areas for Improvement</h4>
            <ul style={{ marginLeft: '1rem' }}>
              {analysisResults.areasForImprovement.map((area, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Clarification Questions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--nmss-black)', margin: 0 }}>
            Clarification Questions
          </h3>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            {showAllQuestions ? 'Show High Priority Only' : 'Show All Questions'}
          </button>
        </div>

        <p style={{ marginBottom: '1.5rem', color: 'var(--medium-gray)' }}>
          Please address these questions to strengthen your proposal. High priority questions 
          are most important for NMSS alignment.
        </p>

        {displayedQuestions.map((question) => (
          <div key={question.id} style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            border: '1px solid #E5E7EB', 
            borderRadius: '0.5rem',
            backgroundColor: question.priority === 'high' ? 'rgba(220, 53, 69, 0.05)' : 'var(--white)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{getPriorityIcon(question.priority)}</span>
              <span className={`badge ${getCategoryColor(question.category)}`}>
                {question.category.toUpperCase()}
              </span>
              <span className={`badge ${question.priority === 'high' ? 'badge-warning' : 'badge-secondary'}`}>
                {question.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            <h4 style={{ marginBottom: '0.5rem', color: 'var(--nmss-black)' }}>
              {question.question}
            </h4>
            
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--nmss-medium-gray)', 
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              {question.context}
            </p>

            <div className="form-group">
              <label htmlFor={`response-${question.id}`} className="form-label">
                Your Response
              </label>
              <textarea
                id={`response-${question.id}`}
                className="form-textarea"
                value={userResponses[question.id] || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Please provide a detailed response..."
                rows={4}
              />
            </div>

            <div className="ai-suggestion" style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--nmss-orange)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  AI
                </div>
                AI Suggestions
              </h4>
              <ul style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
                {question.suggestions.map((suggestion, suggestionIndex) => (
                  <li key={suggestionIndex} style={{ marginBottom: '0.25rem' }}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="ai-suggestion">
        <h4>Response Progress</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span>
            Questions Answered: {Object.keys(userResponses).length} / {analysisResults.questions.length}
          </span>
          <span style={{ 
            color: Object.keys(userResponses).length === analysisResults.questions.length 
              ? 'var(--success-green)' 
              : 'var(--warning-orange)'
          }}>
            {Object.keys(userResponses).length === analysisResults.questions.length 
              ? 'Complete' 
              : 'Incomplete'
            }
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#E5E7EB', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(Object.keys(userResponses).length / analysisResults.questions.length) * 100}%`,
            height: '100%',
            backgroundColor: Object.keys(userResponses).length === analysisResults.questions.length 
              ? 'var(--success-green)' 
              : 'var(--light-sea-green)',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysisSection
