import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApplicationPage from './pages/ApplicationPage'
import ReviewerPage from './pages/ReviewerPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ApplicationPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/reviewer" element={<ReviewerPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
