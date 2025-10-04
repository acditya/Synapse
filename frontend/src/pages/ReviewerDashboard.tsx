import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReviewerSidebar from '../components/ReviewerSidebar'

export default function ReviewerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    { label: 'Assigned', value: 7, color: 'text-[#05585F]', bgColor: 'bg-blue-50' },
    { label: 'Pending Reviews', value: 3, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Completed', value: 4, color: 'text-green-600', bgColor: 'bg-green-50' }
  ]

  const recentApplications = [
    {
      id: 1,
      title: 'Novel Biomarkers for MS Progression',
      applicant: 'Dr. Maria Rodriguez',
      institution: 'University of California',
      submissionDate: '2024-11-15',
      status: 'Pending',
      dueDate: '2024-12-15'
    },
    {
      id: 2,
      title: 'Clinical Trial for MS Treatment',
      applicant: 'Dr. James Wilson',
      institution: 'Johns Hopkins',
      submissionDate: '2024-11-20',
      status: 'In Progress',
      dueDate: '2024-12-20'
    },
    {
      id: 3,
      title: 'MS Rehabilitation Study',
      applicant: 'Dr. Lisa Chen',
      institution: 'Stanford University',
      submissionDate: '2024-11-10',
      status: 'Completed',
      dueDate: '2024-12-10'
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
              <h1 className="text-2xl font-bold text-[#202538]">Reviewer Dashboard</h1>
              <div className="text-sm text-gray-600">
                Welcome back, Dr. Johnson
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</h3>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <div className={`mt-2 w-full h-2 rounded-full ${stat.bgColor}`}>
                  <div 
                    className={`h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                    style={{ width: `${(stat.value / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-[#202538] mb-4">Review Progress</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-semibold text-[#05585F]">4 of 7 completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#00A29D] h-3 rounded-full transition-all duration-300"
                style={{ width: '57%' }}
              ></div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#202538]">Recent Applications</h2>
                <Link 
                  to="/reviewer/assigned"
                  className="text-[#05585F] hover:text-[#00A29D] font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#05585F] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.applicant}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.institution}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/reviewer/review/${app.id}`}
                          className="text-[#05585F] hover:text-[#00A29D]"
                        >
                          {app.status === 'Completed' ? 'View Review' : 'Open Review'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}