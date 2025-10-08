import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApplicationPage from './pages/ApplicationPage'
import ApplicationsListPage from './pages/ApplicationsListPage'
import ReviewerDashboard from './pages/ReviewerDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ApplicationPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/applications" element={<ApplicationsListPage />} />
          <Route path="/reviewer" element={<ReviewerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
