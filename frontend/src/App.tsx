import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApplicationPage from './pages/ApplicationPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ApplicationPage />} />
          <Route path="/application" element={<ApplicationPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
