import { hardcodedApplications } from '../data/hardcodedApplications'

const ReviewerPage = () => {
  const applications = hardcodedApplications

  // Get the main application (Alberto Ascherio's)
  const mainApplication = applications[0]

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return '#17A2B8'
      case 'submitted': return '#FFC107'
      case 'approved': return '#28A745'
      case 'rejected': return '#DC3545'
      default: return '#6C757D'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#DC3545'
      case 'medium': return '#FFC107'
      case 'low': return '#28A745'
      default: return '#6C757D'
    }
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
              Dr. Sarah Johnson • Senior Reviewer
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
                {mainApplication.proposalTitle}
              </h2>
              <p style={{ margin: '0.5rem 0', color: 'var(--nmss-medium-gray)', fontSize: '1rem' }}>
                <strong>PI:</strong> {mainApplication.fullName} • {mainApplication.affiliation}
              </p>
              <p style={{ margin: '0.5rem 0', color: 'var(--nmss-medium-gray)', fontSize: '0.875rem' }}>
                <strong>Submitted:</strong> {new Date(mainApplication.submissionDate).toLocaleDateString()} • 
                <strong> Duration:</strong> {mainApplication.estimatedDuration}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: mainApplication.reviewScore && mainApplication.reviewScore >= 90 ? '#28A745' : '#FFC107'
                }}>
                  {mainApplication.reviewScore}/100
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>AI Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: getPriorityColor(mainApplication.priority)
                }}>
                  {formatCurrency(mainApplication.fundingAmount)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Requested</div>
              </div>
              <div style={{
                backgroundColor: getStatusColor(mainApplication.status),
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {mainApplication.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* AI Insights Summary */}
          <div style={{ 
            backgroundColor: 'rgba(255, 107, 53, 0.05)', 
            border: '1px solid var(--nmss-orange)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                AI
              </div>
              AI Analysis Summary
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
              {mainApplication.aiSummary}
            </p>
          </div>

          {/* Research Priorities */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Research Priorities Alignment</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {mainApplication.researchPriorities.map((priority, index) => (
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
                <span style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Current TRL</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--light-sea-green)' }}>7/9</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '78%',
                  height: '100%',
                  backgroundColor: 'var(--light-sea-green)',
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
                <span style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Completion Rate</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--nmss-orange)' }}>20%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '20%',
                  height: '100%',
                  backgroundColor: 'var(--nmss-orange)',
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
                <span style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Justification Score</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28A745' }}>92%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '92%',
                  height: '100%',
                  backgroundColor: '#28A745',
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
                <span style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Match Score</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--light-sea-green)' }}>87%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '87%',
                  height: '100%',
                  backgroundColor: 'var(--light-sea-green)',
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

        {/* Detailed Application Review */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 2rem 0', color: 'var(--nmss-black)' }}>Detailed Application Review</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Research Abstract */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Research Abstract</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--nmss-medium-gray)' }}>
                {mainApplication.abstract}
              </p>
            </div>

            {/* Risk Assessment */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Risk Assessment</h4>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>Risk Level</span>
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    color: mainApplication.riskAssessment.level === 'low' ? '#28A745' : '#FFC107'
                  }}>
                    {mainApplication.riskAssessment.level.toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--nmss-medium-gray)' }}>
                <strong>Key Factors:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                  {mainApplication.riskAssessment.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compliance Status */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Compliance Status</h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {Object.entries(mainApplication.complianceStatus).map(([key, value]) => (
                  <div key={key} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem',
                    backgroundColor: value ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                    borderRadius: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span style={{ 
                      color: value ? '#28A745' : '#DC3545',
                      fontWeight: 'bold'
                    }}>
                      {value ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Breakdown */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--nmss-black)' }}>Budget Breakdown</h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {Object.entries(mainApplication.budgetBreakdown).map(([category, amount]) => (
                  <div key={category} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 107, 53, 0.05)',
                    borderRadius: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {category}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--nmss-orange)' }}>
                      {formatCurrency(amount.toString())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginTop: '2rem',
          padding: '2rem'
        }}>
          <button style={{
            backgroundColor: '#DC3545',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Reject Application
          </button>
          <button style={{
            backgroundColor: '#FFC107',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Request Revisions
          </button>
          <button style={{
            backgroundColor: '#28A745',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Approve Application
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewerPage