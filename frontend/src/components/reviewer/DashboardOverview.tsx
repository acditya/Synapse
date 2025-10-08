import type { ReviewerStats } from '../../types/reviewerTypes'

interface DashboardOverviewProps {
  stats: ReviewerStats
}

const DashboardOverview = ({ stats }: DashboardOverviewProps) => {
  const statCards = [
    {
      title: 'Total Applications Assigned',
      value: stats.totalAssigned,
      icon: 'DOC',
      color: 'var(--nmss-orange)',
      trend: '+2 this week'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: 'PEND',
      color: 'var(--warning-orange)',
      trend: 'Due in 3 days'
    },
    {
      title: 'AI-Flagged Conflicts',
      value: stats.aiFlaggedConflicts,
      icon: '!',
      color: 'var(--error-red)',
      trend: 'Requires attention'
    },
    {
      title: 'Average Review Time',
      value: `${stats.averageReviewTime}h`,
      icon: 'TIME',
      color: 'var(--success-green)',
      trend: 'Below target'
    }
  ]

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Review Workload Overview</h2>
        <p>AI-powered insights to help you make informed decisions</p>
      </div>
      
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-trend">
                {card.trend}
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="stat-title">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="ai-insights-banner">
        <div className="ai-insights-content">
          <div className="ai-insights-icon">AI</div>
          <div className="ai-insights-text">
            <h3>AI Review Assistant Active</h3>
            <p>Your AI assistant has analyzed all pending applications and identified key insights to accelerate your review process.</p>
          </div>
          <button className="ai-insights-btn">
            View AI Insights
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
