import { useState } from 'react'
import { hardcodedApplications, type ApplicationData } from '../data/hardcodedApplications'

const ApplicationsListPage = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredApplications = hardcodedApplications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesPriority = filterPriority === 'all' || app.priority === filterPriority
    const matchesSearch = searchTerm === '' || 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.proposalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  const getStatusColor = (status: ApplicationData['status']) => {
    switch (status) {
      case 'submitted': return '#FFC107'
      case 'under_review': return '#17A2B8'
      case 'approved': return '#28A745'
      case 'rejected': return '#DC3545'
      default: return '#6C757D'
    }
  }

  const getPriorityColor = (priority: ApplicationData['priority']) => {
    switch (priority) {
      case 'high': return '#DC3545'
      case 'medium': return '#FFC107'
      case 'low': return '#28A745'
      default: return '#6C757D'
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--nmss-black)', marginBottom: '0.5rem' }}>
          Research Grant Applications
        </h1>
        <p style={{ color: 'var(--nmss-medium-gray)' }}>
          Review and manage submitted research grant applications
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Search Applications
          </label>
          <input
            type="text"
            placeholder="Search by name, title, or institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              width: '300px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              width: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Priority
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              width: '150px'
            }}
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredApplications.map((app) => (
          <div
            key={app.id}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              backgroundColor: 'var(--white)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--nmss-black)', marginBottom: '0.5rem' }}>
                  {app.proposalTitle}
                </h3>
                <p style={{ color: 'var(--nmss-medium-gray)', marginBottom: '0.5rem' }}>
                  <strong>PI:</strong> {app.fullName} • {app.affiliation}
                </p>
                <p style={{ color: 'var(--nmss-medium-gray)', fontSize: '0.875rem' }}>
                  <strong>Submitted:</strong> {new Date(app.submissionDate).toLocaleDateString()}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span
                  style={{
                    backgroundColor: getStatusColor(app.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {app.status.replace('_', ' ')}
                </span>
                <span
                  style={{
                    backgroundColor: getPriorityColor(app.priority),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {app.priority} Priority
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--nmss-medium-gray)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {app.abstract.substring(0, 200)}...
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <strong style={{ color: 'var(--nmss-black)' }}>Funding Request:</strong>
                <br />
                <span style={{ color: 'var(--nmss-orange)', fontWeight: 'bold' }}>
                  {formatCurrency(app.fundingAmount)}
                </span>
              </div>
              <div>
                <strong style={{ color: 'var(--nmss-black)' }}>Duration:</strong>
                <br />
                <span style={{ color: 'var(--nmss-medium-gray)' }}>
                  {app.estimatedDuration}
                </span>
              </div>
              <div>
                <strong style={{ color: 'var(--nmss-black)' }}>Review Score:</strong>
                <br />
                <span style={{ 
                  color: app.reviewScore && app.reviewScore >= 90 ? '#28A745' : 
                         app.reviewScore && app.reviewScore >= 80 ? '#FFC107' : '#DC3545',
                  fontWeight: 'bold'
                }}>
                  {app.reviewScore || 'Pending'}/100
                </span>
              </div>
              <div>
                <strong style={{ color: 'var(--nmss-black)' }}>Research Impact:</strong>
                <br />
                <span style={{ color: 'var(--nmss-medium-gray)', fontSize: '0.875rem' }}>
                  {app.researchImpact}
                </span>
              </div>
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
                      backgroundColor: 'rgba(255, 107, 53, 0.1)',
                      color: 'var(--nmss-orange)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {priority}
                  </span>
                ))}
                {app.researchPriorities.length > 3 && (
                  <span style={{ color: 'var(--nmss-medium-gray)', fontSize: '0.75rem' }}>
                    +{app.researchPriorities.length - 3} more
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    backgroundColor: 'var(--nmss-orange)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--nmss-orange)',
                    border: '1px solid var(--nmss-orange)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: 'var(--nmss-medium-gray)'
        }}>
          <h3>No applications found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}

export default ApplicationsListPage
