import { useState } from 'react'
import { hardcodedApplications } from '../data/hardcodedApplications'

const ReviewerDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [decisionSubmitted, setDecisionSubmitted] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'under_review' | 'approved' | 'rejected'>('under_review')
  const applications = hardcodedApplications.filter(app => app.id === 'APP-2024-001').map(app => ({
    ...app,
    status: applicationStatus
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return '#4A90E2'
      case 'submitted': return '#F5A623'
      case 'approved': return '#7ED321'
      case 'rejected': return '#D0021B'
      default: return '#9B9B9B'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#D0021B'
      case 'medium': return '#F5A623'
      case 'low': return '#7ED321'
      default: return '#9B9B9B'
    }
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const handleDecision = (decision: 'approved' | 'rejected' | 'revision') => {
    // Update the application status
    setApplicationStatus(decision === 'approved' ? 'approved' : 
                        decision === 'rejected' ? 'rejected' : 'under_review')
    
    // Show decision submitted message
    setDecisionSubmitted(true)
    
    // Return to dashboard after 2 seconds
    setTimeout(() => {
      setSelectedApplication(null)
      setDecisionSubmitted(false)
    }, 2000)
  }

  // Calculate dashboard stats
  const totalApplications = applications.length
  const pendingReviews = applicationStatus === 'under_review' ? 1 : 0
  const approvedApplications = applicationStatus === 'approved' ? 1 : 0
  const highPriorityApplications = applications.filter(app => app.priority === 'high').length

  if (selectedApplication) {
    const app = applications.find(a => a.id === selectedApplication)
    if (!app) return null

    // Show decision submitted message
    if (decisionSubmitted) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #E8E8E8'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#7ED321',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '2rem',
              color: 'white'
            }}>
              ✓
            </div>
            <h2 style={{ 
              color: '#2C3E50', 
              marginBottom: '1rem',
              fontSize: '1.75rem'
            }}>
              Decision Submitted!
            </h2>
            <p style={{ 
              color: '#7F8C8D', 
              fontSize: '1rem',
              marginBottom: '0'
            }}>
              Your review decision has been successfully submitted and recorded.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #E5E7EB', 
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setSelectedApplication(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #E5E7EB',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Back to Dashboard
              </button>
              <img 
                src="/National-MS-Society-1024x1024.avif" 
                alt="NMSS Logo" 
                style={{ height: '50px', width: 'auto' }}
              />
              <img 
                src="/image-removebg-preview (36).png" 
                alt="Synapse Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--nmss-black)' }}>
                  Application Review: {app.id}
                </h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                  NMSS ID: NMSS-2024-A81AZIG63 • AI-Powered Review System
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: 'var(--nmss-orange)', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                Dr. Anand Chatterjee • Senior Reviewer
              </div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          {/* Application Overview */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            padding: '2rem', 
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--nmss-black)', fontSize: '1.75rem' }}>
                  {app.proposalTitle}
                </h2>
                <p style={{ margin: '0.5rem 0', color: 'var(--nmss-medium-gray)', fontSize: '1rem' }}>
                  <strong>PI:</strong> {app.fullName} • {app.affiliation}
                </p>
                <p style={{ margin: '0.5rem 0', color: 'var(--nmss-medium-gray)', fontSize: '0.875rem' }}>
                  <strong>NMSS ID:</strong> NMSS-2024-A81AZIG63 • 
                  <strong>Submitted:</strong> {new Date(app.submissionDate).toLocaleDateString()} • 
                  <strong> Duration:</strong> {app.estimatedDuration}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: app.reviewScore && app.reviewScore >= 90 ? '#28A745' : '#FFC107'
                  }}>
                    {app.reviewScore}/100
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>AI Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: getPriorityColor(app.priority)
                  }}>
                    {formatCurrency(app.fundingAmount)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Requested</div>
                </div>
                <div style={{
                  backgroundColor: getStatusColor(applicationStatus),
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {applicationStatus.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Comprehensive AI Insights */}
            <div style={{ 
              backgroundColor: '#F8F9FA', 
              border: '1px solid #E8E8E8', 
              borderRadius: '0.75rem', 
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 2rem 0', color: '#2C3E50', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '600' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: '#4A90E2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  AI
                </div>
                AI-Powered Research Assessment
              </h3>
              
              {/* Study Overview */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#2C3E50', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Study Overview & Objectives</h4>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E8E8E8' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#2C3E50' }}>
                    <strong>Research Focus:</strong> This longitudinal cohort study investigates the relationship between Epstein-Barr virus (EBV) infection and multiple sclerosis (MS) risk using a population-based approach with 50,000+ participants over 10 years.
                  </p>
                  <br />
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#2C3E50' }}>
                    <strong>Primary Objectives:</strong> (1) Examine EBV seroconversion patterns and viral load dynamics, (2) Assess relationship between EBV and MS development, (3) Control for genetic and environmental factors, (4) Identify novel prevention strategies for MS.
                  </p>
                </div>
              </div>

              {/* NMSS Strategic Alignment */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#2C3E50', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>NMSS Strategic Alignment</h4>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E8E8E8' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#2C3E50', marginBottom: '1rem' }}>
                    <strong>Mission Alignment:</strong> This research directly addresses NMSS's core mission of advancing MS research and treatment. The study's focus on EBV-MS relationship aligns with current NMSS research priorities in MS etiology and prevention.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#F0F8FF', borderRadius: '0.5rem', border: '1px solid #B3D9FF' }}>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Etiology Research</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Understanding MS causes and risk factors</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#F0FFF0', borderRadius: '0.5rem', border: '1px solid #B3E6B3' }}>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Prevention Focus</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Identifying prevention strategies</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#FFF8F0', borderRadius: '0.5rem', border: '1px solid #FFD9B3' }}>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Population Impact</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Large-scale population health impact</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Impact Assessment */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#2C3E50', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Research Impact Potential</h4>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E8E8E8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Scientific Impact</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5' }}>
                        Potential to revolutionize understanding of MS etiology through comprehensive EBV-MS relationship analysis
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Clinical Translation</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5' }}>
                        High potential for identifying novel prevention strategies and early intervention approaches
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Global Relevance</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5' }}>
                        Findings applicable to global MS population with significant public health implications
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicant Expertise Assessment */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#2C3E50', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Principal Investigator Assessment</h4>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E8E8E8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F0F8FF', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A90E2' }}>170</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>H-Index</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#F0FFF0', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7ED321' }}>189,679</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Total Citations</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#FFF8F0', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F5A623' }}>412</div>
                      <div style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Publications</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#2C3E50' }}>
                    <strong>Expertise Assessment:</strong> Dr. Ascherio demonstrates exceptional expertise in MS epidemiology with a world-renowned track record. His recent Science publication on EBV-MS relationship has been cited over 2,000 times, establishing him as a leading authority in this field.
                  </p>
                </div>
              </div>

              {/* AI-Generated Questions & Responses */}
              <div>
                <h4 style={{ color: '#2C3E50', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>AI-Generated Review Questions & Responses</h4>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E8E8E8' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Q: How will your EBV-MS findings translate into practical prevention strategies?</div>
                    <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5', paddingLeft: '1rem', borderLeft: '3px solid #4A90E2' }}>
                      <strong>AI Assessment:</strong> The longitudinal study design provides strong foundation for identifying EBV vaccination strategies and monitoring protocols for high-risk individuals. The large sample size enables robust statistical analysis for prevention strategy development.
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Q: What is the clinical translation pathway for your research?</div>
                    <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5', paddingLeft: '1rem', borderLeft: '3px solid #7ED321' }}>
                      <strong>AI Assessment:</strong> Clear pathway from epidemiological findings to clinical trials, with potential for EBV-targeted therapies and early intervention protocols. Strong potential for pharmaceutical industry collaboration.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>Q: How will this research benefit the global MS community?</div>
                    <div style={{ fontSize: '0.875rem', color: '#7F8C8D', lineHeight: '1.5', paddingLeft: '1rem', borderLeft: '3px solid #F5A623' }}>
                      <strong>AI Assessment:</strong> Global applicability through comprehensive population-based approach. Findings will inform international MS prevention strategies and contribute to WHO guidelines on neurological disorders.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Priorities */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Research Priorities Alignment</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {app.researchPriorities.map((priority, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: 'rgba(255, 107, 53, 0.1)',
                      color: 'var(--nmss-orange)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {priority}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI-Powered Analysis Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* TRL Evaluation */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  TRL
                </div>
                Technology Readiness Level
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Current TRL</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4A90E2' }}>7/9</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#E8E8E8', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '78%',
                    height: '100%',
                    backgroundColor: '#4A90E2',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                <strong>AI Assessment:</strong> Research demonstrates system prototype demonstration in operational environment. 
                Longitudinal cohort study design shows strong methodological foundation for clinical translation.
              </div>
            </div>

            {/* Milestone Evaluator */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--nmss-orange)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  M
                </div>
                Milestone Progress
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Completion Rate</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F5A623' }}>20%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#E8E8E8', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '20%',
                    height: '100%',
                    backgroundColor: '#F5A623',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                <strong>Next Milestone:</strong> Participant Recruitment Phase 1 (Due: June 30, 2024)
              </div>
            </div>

            {/* Budget Evaluator */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#28A745', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  B
                </div>
                Budget Analysis
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Justification Score</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7ED321' }}>92%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#E8E8E8', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '92%',
                    height: '100%',
                    backgroundColor: '#7ED321',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                <strong>AI Assessment:</strong> Budget allocation is well-justified with appropriate personnel costs (60%), 
                equipment (20%), and operational expenses. Aligns with project scope and duration.
              </div>
            </div>

            {/* NMSS Cross-Collaboration Finder */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  C
                </div>
                Collaboration Opportunities
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#7F8C8D' }}>Match Score</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4A90E2' }}>87%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#E8E8E8', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '87%',
                    height: '100%',
                    backgroundColor: '#4A90E2',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                <strong>AI Recommendations:</strong> 3 potential collaborators identified with complementary expertise in 
                EBV research, MS epidemiology, and longitudinal study design.
              </div>
            </div>
          </div>

          {/* Professional Review Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1.5rem', 
            marginTop: '2rem',
            padding: '2rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '0.75rem',
            border: '1px solid #E8E8E8'
          }}>
            <button 
              onClick={() => handleDecision('rejected')}
              style={{
                backgroundColor: '#D0021B',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(208, 2, 27, 0.2)'
              }}>
              Decline for Funding
            </button>
            <button 
              onClick={() => handleDecision('revision')}
              style={{
                backgroundColor: '#F5A623',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(245, 166, 35, 0.2)'
              }}>
              Request Major Revisions
            </button>
            <button 
              onClick={() => handleDecision('approved')}
              style={{
                backgroundColor: '#7ED321',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(126, 211, 33, 0.2)'
              }}>
              Recommend for Funding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #E5E7EB', 
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/National-MS-Society-1024x1024.avif" 
              alt="NMSS Logo" 
              style={{ height: '50px', width: 'auto' }}
            />
            <img 
              src="/image-removebg-preview (36).png" 
              alt="Synapse Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--nmss-black)' }}>
                AI-Powered Review Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                Intelligent Grant Review System
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--nmss-orange)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              Dr. Anand Chatterjee • Senior Reviewer
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Dashboard Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #F0F0F0'
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '600', color: '#2C3E50', marginBottom: '0.5rem' }}>
              {totalApplications}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7F8C8D', fontWeight: '500' }}>Total Applications</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #F0F0F0'
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '600', color: '#4A90E2', marginBottom: '0.5rem' }}>
              {pendingReviews}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7F8C8D', fontWeight: '500' }}>Pending Reviews</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #F0F0F0'
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '600', color: '#7ED321', marginBottom: '0.5rem' }}>
              {approvedApplications}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7F8C8D', fontWeight: '500' }}>Approved</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #F0F0F0'
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '600', color: '#D0021B', marginBottom: '0.5rem' }}>
              {highPriorityApplications}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7F8C8D', fontWeight: '500' }}>High Priority</div>
          </div>
          
        </div>

        {/* Applications List */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 2rem 0', color: 'var(--nmss-black)' }}>
            {applicationStatus === 'under_review' ? 'Applications Submitted' : 
             applicationStatus === 'approved' ? 'Applications Approved' : 
             'Applications Rejected'}
          </h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApplication(app.id)}
                style={{
                  border: '1px solid #E8E8E8',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4A90E2'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E8E8E8'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    {app.researcherImage && (
                      <img 
                        src={app.researcherImage} 
                        alt={app.fullName}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: '2px solid #F0F0F0'
                        }}
                      />
                    )}
                    <div>
                      <h3 style={{ margin: 0, color: '#2C3E50', fontSize: '1.25rem', fontWeight: '600' }}>
                        {app.proposalTitle}
                      </h3>
                      <p style={{ margin: '0.5rem 0', color: '#7F8C8D', fontSize: '0.95rem' }}>
                        <strong>Principal Investigator:</strong> {app.fullName}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#7F8C8D', fontSize: '0.875rem' }}>
                        {app.affiliation}
                      </p>
                      <p style={{ margin: '0.5rem 0', color: '#7F8C8D', fontSize: '0.875rem' }}>
                        <strong>NMSS ID:</strong> NMSS-2024-A81AZIG63 • 
                        <strong>Submitted:</strong> {new Date(app.submissionDate).toLocaleDateString()} • 
                        <strong> Duration:</strong> {app.estimatedDuration}
                      </p>
                      {app.scopusUrl && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                          <a 
                            href={app.scopusUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#4A90E2', textDecoration: 'none' }}
                          >
                            View Scopus Profile →
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: app.reviewScore && app.reviewScore >= 90 ? '#28A745' : '#FFC107'
                      }}>
                        {app.reviewScore}/100
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nmss-medium-gray)' }}>AI Score</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        color: getPriorityColor(app.priority)
                      }}>
                        {formatCurrency(app.fundingAmount)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nmss-medium-gray)' }}>Requested</div>
                    </div>
                <div style={{
                  backgroundColor: getStatusColor(applicationStatus),
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {applicationStatus.replace('_', ' ')}
                </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--nmss-medium-gray)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {app.abstract.substring(0, 200)}...
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {app.researchPriorities.slice(0, 3).map((priority, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#F8F9FA',
                          color: '#4A90E2',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: '1px solid #E8E8E8'
                        }}
                      >
                        {priority}
                      </span>
                    ))}
                    {app.researchPriorities.length > 3 && (
                      <span style={{ color: '#7F8C8D', fontSize: '0.75rem', fontWeight: '500' }}>
                        +{app.researchPriorities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    color: '#4A90E2', 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    Review Application →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewerDashboard
