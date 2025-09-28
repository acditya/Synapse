import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TriageBoard from './pages/TriageBoard'
import BriefView from './pages/BriefView'
import ReviewerList from './pages/ReviewerList'
import ComplianceReport from './pages/ComplianceReport'
import GrantDetails from './pages/GrantDetails'
import ReviewerDetails from './pages/ReviewerDetails'
import UploadGrant from './pages/UploadGrant'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/triage" element={<TriageBoard />} />
        <Route path="/brief" element={<BriefView />} />
        <Route path="/reviewers" element={<ReviewerList />} />
        <Route path="/reviewers/:id" element={<ReviewerDetails />} />
        <Route path="/compliance" element={<ComplianceReport />} />
        <Route path="/grants/:id" element={<GrantDetails />} />
        <Route path="/upload" element={<UploadGrant />} />
      </Routes>
    </Layout>
  )
}

export default App