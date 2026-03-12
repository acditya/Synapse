import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApplicationPage from './pages/ApplicationPage'
import ApplicationsListPage from './pages/ApplicationsListPage'
import ReviewerDashboard from './pages/ReviewerDashboard'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/researcher-view" element={<ApplicationPage />} />
          <Route path="/nmss-auditor-view" element={<ReviewerDashboard />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/applications" element={<ApplicationsListPage />} />
          <Route path="/reviewer" element={<ReviewerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
