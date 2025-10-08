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
            title: "Heart disease and stroke statistics—2014 update: a report from the American Heart Association",
            authors: ["AS Go", "D Mozaffarian", "VL Roger", "EJ Benjamin", "JD Berry", "MJ Blaha", "S Dai", "A Ascherio"],
            journal: "Circulation",
            year: 2014,
            citations: 73134,
            doi: "10.1161/01.cir.0000441139.02102.80"
          },
          {
            title: "Vitamin E consumption and the risk of coronary heart disease in men",
            authors: ["EB Rimm", "MJ Stampfer", "A Ascherio", "E Giovannucci", "GA Colditz"],
            journal: "New England Journal of Medicine",
            year: 1993,
            citations: 3301,
            doi: "10.1056/NEJM199305203282003"
          },
          {
            title: "Serum 25-hydroxyvitamin D levels and risk of multiple sclerosis",
            authors: ["KL Munger", "LI Levin", "BW Hollis", "NS Howard", "A Ascherio"],
            journal: "JAMA",
            year: 2006,
            citations: 2770,
            doi: "10.1001/jama.296.23.2832"
          },
          {
            title: "Trans fatty acids and cardiovascular disease",
            authors: ["D Mozaffarian", "MB Katan", "A Ascherio", "MJ Stampfer", "WC Willett"],
            journal: "New England Journal of Medicine",
            year: 2006,
            citations: 2371,
            doi: "10.1056/NEJMra054035"
          },
          {
            title: "The epidemiology of Parkinson's disease: risk factors and prevention",
            authors: ["A Ascherio", "MA Schwarzschild"],
            journal: "The Lancet Neurology",
            year: 2016,
            citations: 2273,
            doi: "10.1016/S1474-4422(16)30230-7"
          },
          {
            title: "Longitudinal analysis reveals high prevalence of Epstein-Barr virus associated with multiple sclerosis",
            authors: ["K Bjornevik", "M Cortese", "BC Healy", "J Kuhle", "MJ Mina", "Y Leng", "SJ Elledge", "A Ascherio"],
            journal: "Science",
            year: 2022,
            citations: 2160,
            doi: "10.1126/science.abj8222"
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
        <div className="ai-suggestion demo-highlight">
          <div className="demo-badge">Top Researcher</div>
          <h4>Recent Publications Found</h4>
          
          {/* Demo stats for Alberto Ascherio */}
          <div className="demo-stats">
            <div className="demo-stat-item">
              <span className="demo-stat-number">189,679</span>
              <span className="demo-stat-label">Total Citations</span>
            </div>
            <div className="demo-stat-item">
              <span className="demo-stat-number">170</span>
              <span className="demo-stat-label">H-Index</span>
            </div>
            <div className="demo-stat-item">
              <span className="demo-stat-number">423</span>
              <span className="demo-stat-label">i10-Index</span>
            </div>
            <div className="demo-stat-item">
              <span className="demo-stat-number">52,756</span>
              <span className="demo-stat-label">Citations Since 2020</span>
            </div>
          </div>

          <div className="demo-expertise">
            <h4>Research Expertise</h4>
            <ul>
              <li>Multiple Sclerosis Epidemiology</li>
              <li>Epstein-Barr Virus Research</li>
              <li>Environmental Factors in MS</li>
              <li>Vitamin D and MS Risk</li>
              <li>Parkinson's Disease Epidemiology</li>
              <li>Nutritional Epidemiology</li>
            </ul>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {publications.map((pub, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                border: '1px solid var(--nmss-orange)', 
                borderRadius: '0.5rem', 
                marginBottom: '0.5rem',
                backgroundColor: 'var(--nmss-white)',
                position: 'relative'
              }}>
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'var(--nmss-orange)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    TOP CITED
                  </div>
                )}
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {pub.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  {pub.authors.join(', ')} • {pub.journal} ({pub.year}) • {pub.citations.toLocaleString()} citations
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

        <div className="form-group">
          <label htmlFor="additionalProfileInfo" className="form-label">
            Additional Profile Information
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Optional - any other information about your research profile)
            </span>
          </label>
          <textarea
            id="additionalProfileInfo"
            className="form-textarea"
            value={formData.additionalProfileInfo || ''}
            onChange={(e) => updateFormData({ additionalProfileInfo: e.target.value })}
            placeholder="Add any additional information about your research background, collaborations, awards, or other relevant details that would strengthen your application..."
            rows={4}
          />
        </div>

        {/* Collaborators Section */}
        <div className="form-group">
          <label className="form-label">
            Research Team & Collaborators
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Add team members and collaborators)
            </span>
          </label>
          
          {/* Suggested Collaborators */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--nmss-black)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
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
              AI-Suggested Collaborators
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)', marginBottom: '1rem' }}>
              Based on your publication history and co-authorship patterns
            </div>
            
            {/* Suggested Collaborators */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)'
              e.currentTarget.style.borderColor = 'var(--nmss-orange)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                DM
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Dariush Mozaffarian
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Co-authored 12 papers • Tufts University
                </div>
              </div>
              <button
                type="button"
                style={{
                  background: 'var(--nmss-orange)',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)'
              e.currentTarget.style.borderColor = 'var(--nmss-orange)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                MS
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Meir Stampfer
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Co-authored 8 papers • Harvard T.H. Chan School of Public Health
                </div>
              </div>
              <button
                type="button"
                style={{
                  background: 'var(--nmss-orange)',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)'
              e.currentTarget.style.borderColor = 'var(--nmss-orange)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = '#E5E7EB'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                EG
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Edward Giovannucci
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Co-authored 6 papers • Harvard T.H. Chan School of Public Health
                </div>
              </div>
              <button
                type="button"
                style={{
                  background: 'var(--nmss-orange)',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Manual Add Button */}
          <div style={{ 
            border: '2px dashed var(--nmss-orange)', 
            borderRadius: '0.5rem', 
            padding: '1.5rem', 
            textAlign: 'center',
            backgroundColor: 'rgba(255, 107, 53, 0.05)',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--nmss-orange)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 0.75rem auto'
            }}>
              +
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--nmss-orange)' }}>
              Manually Add Collaborator
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)', marginBottom: '1rem' }}>
              Add someone not in the suggestions above
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ 
                borderColor: 'var(--nmss-orange)', 
                color: 'var(--nmss-orange)',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem'
              }}
            >
              + Add Manually
            </button>
          </div>

          {/* Pre-loaded Collaborators for Demo */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--nmss-black)' }}>
              Current Team Members:
            </div>
            
            {/* Principal Investigator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(0, 123, 191, 0.1)', 
              border: '1px solid var(--light-sea-green)', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--nmss-orange)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                AA
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Alberto Ascherio
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Principal Investigator • Harvard University
                </div>
              </div>
              <div style={{
                background: 'var(--nmss-orange)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                PI
              </div>
            </div>

            {/* Co-Investigators */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                KB
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Kjetil Bjornevik
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Co-Investigator • Harvard T.H. Chan School of Public Health
                </div>
              </div>
              <div style={{
                background: 'var(--light-sea-green)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Co-I
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                MC
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Marianna Cortese
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Co-Investigator • Harvard Medical School
                </div>
              </div>
              <div style={{
                background: 'var(--light-sea-green)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Co-I
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--light-sea-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                JL
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--nmss-black)' }}>
                  Dr. Jeffrey Kuhle
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  Collaborator • University Hospital Basel
                </div>
              </div>
              <div style={{
                background: 'var(--success-green)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                COL
              </div>
            </div>
          </div>

          <div className="ai-suggestion">
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
              Collaboration Benefits
            </h4>
            <p>
              Adding collaborators helps strengthen your proposal by demonstrating:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Multi-institutional expertise and resources</li>
              <li>Diverse perspectives and methodologies</li>
              <li>Enhanced data collection and analysis capabilities</li>
              <li>Stronger potential for impactful research outcomes</li>
            </ul>
          </div>
        </div>

        {/* Required Documents Section */}
        <div className="form-group">
          <label className="form-label">
            Required Documents
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--medium-gray)' }}>
              (Upload required documents for your research team)
            </span>
          </label>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* CVs/GCPs */}
            <div style={{ 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              backgroundColor: 'rgba(255, 107, 53, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--nmss-black)' }}>
                    CVs/GCPs for Research Team
                    <span style={{ color: '#DC3545', marginLeft: '0.5rem' }}>*</span>
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                    Curriculum vitae and good clinical practice certificates for all team members
                  </p>
                </div>
                <span style={{
                  background: '#DC3545',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  REQUIRED
                </span>
              </div>

              <div
                className="file-upload-area"
                style={{ cursor: 'pointer' }}
              >
                <div className="file-upload-icon">📄</div>
                <div>
                  <strong>Click to upload CVs/GCPs for Research Team</strong>
                  <br />
                  <span style={{ color: 'var(--medium-gray)' }}>
                    PDF or Word document (max 10MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Consent Form */}
            <div style={{ 
              border: '1px solid #E5E7EB', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              backgroundColor: 'var(--white)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--nmss-black)' }}>
                    Consent Form
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                    Informed consent form for study participants (if applicable)
                  </p>
                </div>
              </div>

              <div
                className="file-upload-area"
                style={{ cursor: 'pointer' }}
              >
                <div className="file-upload-icon">📄</div>
                <div>
                  <strong>Click to upload Consent Form</strong>
                  <br />
                  <span style={{ color: 'var(--medium-gray)' }}>
                    PDF or Word document (max 10MB)
                  </span>
                </div>
              </div>
            </div>
          </div>
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
