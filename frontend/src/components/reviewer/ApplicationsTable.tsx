import type { Application } from '../../types/reviewerTypes'

interface ApplicationsTableProps {
  applications: Application[]
  onApplicationSelect: (application: Application) => void
  selectedApplicationId?: string
}

const ApplicationsTable = ({ 
  applications, 
  onApplicationSelect, 
  selectedApplicationId 
}: ApplicationsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--warning-orange)'
      case 'under_review': return 'var(--info-blue)'
      case 'completed': return 'var(--success-green)'
      default: return 'var(--nmss-medium-gray)'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--error-red)'
      case 'medium': return 'var(--warning-orange)'
      case 'low': return 'var(--success-green)'
      default: return 'var(--nmss-medium-gray)'
    }
  }

  const getRelevanceScoreColor = (score: number) => {
    if (score >= 85) return 'var(--success-green)'
    if (score >= 70) return 'var(--warning-orange)'
    return 'var(--error-red)'
  }

  return (
    <div className="applications-table-container">
      <div className="table-header">
        <h2>Assigned Applications</h2>
        <div className="table-controls">
          <div className="filter-controls">
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
            </select>
            <select className="filter-select">
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div className="search-controls">
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="applications-grid">
        {applications.map((application) => (
          <div 
            key={application.id}
            className={`application-card ${
              selectedApplicationId === application.id ? 'selected' : ''
            }`}
            onClick={() => onApplicationSelect(application)}
          >
            <div className="application-card-header">
              <div className="application-id">
                {application.id}
              </div>
              <div className="application-priority">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(application.priority) }}
                >
                  {application.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="application-card-content">
              <h3 className="applicant-name">
                {application.applicantName}
              </h3>
              <p className="proposal-title">
                {application.proposalTitle}
              </p>
              <div className="research-area">
                <span className="area-label">Research Area:</span>
                <span className="area-tags">
                  {application.researchArea}
                </span>
              </div>
            </div>

            <div className="application-card-metrics">
              <div className="metric">
                <span className="metric-label">AI Relevance</span>
                <span 
                  className="metric-value"
                  style={{ color: getRelevanceScoreColor(application.aiRelevanceScore) }}
                >
                  {application.aiRelevanceScore}%
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Status</span>
                <span 
                  className="metric-value"
                  style={{ color: getStatusColor(application.status) }}
                >
                  {application.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="application-card-footer">
              <div className="application-flags">
                {application.coiFlag && (
                  <span className="coi-flag">
                    ! COI Detected
                  </span>
                )}
                {application.aiInsights.conflicts.length > 0 && (
                  <span className="conflict-flag">
                    SEARCH AI Conflicts
                  </span>
                )}
              </div>
              <div className="application-date">
                Submitted: {new Date(application.submissionDate).toLocaleDateString()}
              </div>
            </div>

            <div className="application-card-actions">
              <button className="action-btn primary">
                Review Now
              </button>
              <button className="action-btn secondary">
                Quick Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicationsTable
