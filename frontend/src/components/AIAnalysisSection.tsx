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
  const [userResponses, setUserResponses] = useState<Record<string, string>>(formData.aiResponses || {})
  const [showAllQuestions, setShowAllQuestions] = useState(false)

  // Simulate AI analysis
  useEffect(() => {
    const analyzeProposal = async () => {
      setIsAnalyzing(true)
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock AI analysis results
      const mockAnalysis = {
        overallScore: 78,
        strengths: [
          "Strong focus on neuroinflammation mechanisms",
          "Clear translational potential",
          "Well-defined methodology",
          "Experienced research team"
        ],
        areasForImprovement: [
          "Limited discussion of patient engagement",
          "Unclear timeline for clinical translation",
          "Missing cost-effectiveness analysis"
        ],
        nmssAlignment: [
          "Neuroinflammation Research Priority",
          "Biomarker Development",
          "Therapeutic Innovation"
        ],
        questions: [
          {
            id: "patient-impact",
            question: "How will your research directly benefit MS patients in the next 5-10 years?",
            category: "impact" as const,
            priority: "high" as const,
            context: "NMSS prioritizes research with clear patient impact and translational potential.",
            suggestions: [
              "Describe specific patient populations that would benefit",
              "Explain how findings could lead to new treatments",
              "Mention potential for early diagnosis or prevention"
            ]
          },
          {
            id: "diversity-inclusion",
            question: "How will you ensure diverse representation in your study population?",
            category: "methodology" as const,
            priority: "high" as const,
            context: "NMSS emphasizes inclusive research that represents all MS patients.",
            suggestions: [
              "Describe recruitment strategies for diverse populations",
              "Mention partnerships with community organizations",
              "Explain how you'll address health disparities"
            ]
          },
          {
            id: "collaboration",
            question: "What partnerships will you establish with MS clinics and patient organizations?",
            category: "alignment" as const,
            priority: "medium" as const,
            context: "NMSS values collaborative research that involves the MS community.",
            suggestions: [
              "Identify specific MS centers for collaboration",
              "Mention patient advisory board involvement",
              "Describe community engagement strategies"
            ]
          },
          {
            id: "clinical-translation",
            question: "What is your pathway from basic research to clinical application?",
            category: "feasibility" as const,
            priority: "high" as const,
            context: "NMSS seeks research with clear clinical translation potential.",
            suggestions: [
              "Outline specific milestones for clinical testing",
              "Identify potential regulatory pathways",
              "Describe partnership opportunities with pharmaceutical companies"
            ]
          },
          {
            id: "innovation",
            question: "What novel approaches or technologies will you use?",
            category: "innovation" as const,
            priority: "medium" as const,
            context: "NMSS encourages innovative research approaches.",
            suggestions: [
              "Highlight cutting-edge techniques or technologies",
              "Explain how your approach differs from existing methods",
              "Describe potential for breakthrough discoveries"
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
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
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
      <div className="card" style={{ backgroundColor: 'rgba(255, 107, 53, 0.05)', border: '1px solid var(--nmss-orange)' }}>
        <h3 style={{ color: 'var(--nmss-orange)', marginBottom: '1rem' }}>
          AI Analysis Summary
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <strong>Overall Score:</strong>
            <div style={{ fontSize: '2rem', color: 'var(--nmss-orange)', fontWeight: 'bold' }}>
              {analysisResults.overallScore}/100
            </div>
          </div>
          <div>
            <strong>NMSS Alignment:</strong>
            <div className="priority-badges">
              {analysisResults.nmssAlignment.map((priority, index) => (
                <span key={index} className="badge badge-primary">
                  {priority}
                </span>
              ))}
            </div>
          </div>
          <div>
            <strong>Priority Questions:</strong>
            <div style={{ fontSize: '1.5rem', color: 'var(--warning-orange)' }}>
              {analysisResults.questions.filter(q => q.priority === 'high').length}
            </div>
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
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>💡 AI Suggestions</h4>
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
