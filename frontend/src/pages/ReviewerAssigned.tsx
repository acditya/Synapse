import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReviewerSidebar from '../components/ReviewerSidebar'

export default function ReviewerAssigned() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const applications = [
    {
      id: 1,
      title: 'Novel Biomarkers for MS Progression',
      applicant: 'Dr. Maria Rodriguez',
      institution: 'University of California',
      submissionDate: '2024-11-15',
      status: 'Pending',
      dueDate: '2024-12-15',
      priority: 'High',
      abstract: 'This study investigates novel biomarkers for multiple sclerosis progression using advanced neuroimaging techniques and machine learning approaches.'
    },
    {
      id: 2,
      title: 'Clinical Trial for MS Treatment',
      applicant: 'Dr. James Wilson',
      institution: 'Johns Hopkins',
      submissionDate: '2024-11-20',
      status: 'In Progress',
      dueDate: '2024-12-20',
      priority: 'Medium',
      abstract: 'A randomized controlled trial examining the efficacy of a new MS treatment protocol with focus on patient outcomes and safety measures.'
    },
    {
      id: 3,
      title: 'MS Rehabilitation Study',
      applicant: 'Dr. Lisa Chen',
      institution: 'Stanford University',
      submissionDate: '2024-11-10',
      status: 'Pending',
      dueDate: '2024-12-10',
      priority: 'Low',
      abstract: 'Investigating the effectiveness of novel rehabilitation approaches for MS patients with mobility impairments.'
    },
    {
      id: 4,
      title: 'MS Genetics Research',
      applicant: 'Dr. Michael Brown',
      institution: 'Harvard Medical School',
      submissionDate: '2024-11-25',
      status: 'In Progress',
      dueDate: '2024-12-25',
      priority: 'High',
      abstract: 'Genome-wide association study to identify genetic markers associated with MS susceptibility and progression.'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-200 text-gray-700'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <ReviewerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-[#202538]">Assigned Applications</h1>
              <div className="text-sm text-gray-600">
                {filteredApplications.length} applications
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['all', 'pending', 'in progress', 'completed'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-white text-[#05585F] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#202538] mb-2">{app.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{app.applicant}</p>
                    <p className="text-sm text-gray-500">{app.institution}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(app.priority)}`}>
                      {app.priority} Priority
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{app.abstract}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Submitted: {app.submissionDate}</span>
                  <span>Due: {app.dueDate}</span>
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/reviewer/review/${app.id}`}
                    className="flex-1 bg-[#05585F] text-white px-4 py-2 rounded-lg hover:bg-[#00A29D] transition-colors text-center font-medium"
                  >
                    {app.status === 'Completed' ? 'View Review' : 'Open Review'}
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">No applications match your current filter.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
