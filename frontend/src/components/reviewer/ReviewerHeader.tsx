import { useState } from 'react'

const ReviewerHeader = () => {
  const [showProfile, setShowProfile] = useState(false)
  const [notifications] = useState(3)

  return (
    <header className="reviewer-header">
      <div className="reviewer-header-content">
        <div className="reviewer-header-left">
          <img 
            src="/National-MS-Society-1024x1024.avif" 
            alt="NMSS Logo" 
            className="reviewer-logo"
          />
          <div className="reviewer-title">
            <h1>Reviewer Dashboard</h1>
            <p>AI-Assisted Grant Review System</p>
          </div>
        </div>
        
        <div className="reviewer-header-right">
          <div className="notifications">
            <button className="notification-btn">
              <span className="notification-icon">NOTIF</span>
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
          </div>
          
          <div className="reviewer-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="profile-avatar">
                <span>DR</span>
              </div>
              <div className="profile-info">
                <span className="profile-name">Dr. Sarah Johnson</span>
                <span className="profile-role">Senior Reviewer</span>
              </div>
              <span className="profile-arrow">▼</span>
            </button>
            
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <h3>Dr. Sarah Johnson</h3>
                  <p>Senior Reviewer • Neurology</p>
                </div>
                <div className="profile-dropdown-stats">
                  <div className="stat">
                    <span className="stat-label">Reviews Completed</span>
                    <span className="stat-value">47</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Average Rating</span>
                    <span className="stat-value">4.8/5</span>
                  </div>
                </div>
                <div className="profile-dropdown-actions">
                  <button className="dropdown-action">Profile Settings</button>
                  <button className="dropdown-action">Review History</button>
                  <button className="dropdown-action">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default ReviewerHeader
