import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReviewerSidebar from '../components/ReviewerSidebar'

export default function ReviewerCompleted() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const completedReviews = [
    {
      id: 1,
      title: 'MS Rehabilitation Study',
      applicant: 'Dr. Lisa Chen',
      institution: 'Stanford University',
      submissionDate: '2024-11-10',
      reviewDate: '2024-11-28',
      scores: { significance: 4, feasibility: 5, innovation: 3, budgetJustification: 4 },
      averageScore: 4.0,
      recommendation: 'Approve',
      comments: 'This study presents a well-designed rehabilitation approach for MS patients. The methodology is sound and the budget is justified. The innovation could be stronger, but overall this is a solid proposal.',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'MS Genetics Research',
      applicant: 'Dr. Michael Brown',
      institution: 'Harvard Medical School',
      submissionDate: '2024-11-05',
      reviewDate: '2024-11-22',
      scores: { significance: 5, feasibility: 4, innovation: 5, budgetJustification: 3 },
      averageScore: 4.25,
      recommendation: 'Approve',
      comments: 'Excellent research proposal with high significance and innovation. The genetic approach is novel and well-executed. Budget could be better justified but the science is compelling.',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'MS Drug Development',
      applicant: 'Dr. Sarah Johnson',
      institution: 'Mayo Clinic',
      submissionDate: '2024-10-30',
      reviewDate: '2024-11-15',
      scores: { significance: 3, feasibility: 2, innovation: 3, budgetJustification: 2 },
      averageScore: 2.5,
      recommendation: 'Revise & Resubmit',
      comments: 'The proposal has potential but needs significant improvements in feasibility and budget justification. The methodology needs refinement and the timeline appears unrealistic.',
      status: 'Completed'
    }
  ]

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Approve': return 'bg-green-100 text-green-800'
      case 'Revise & Resubmit': return 'bg-yellow-100 text-yellow-800'
      case 'Reject': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredReviews = completedReviews.filter(review => {
    if (filter === 'all') return true
    return review.recommendation.toLowerCase().includes(filter.toLowerCase())
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
              <h1 className="text-2xl font-bold text-[#202538]">Completed Reviews</h1>
              <div className="text-sm text-gray-600">
                {filteredReviews.length} reviews completed
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['all', 'approve', 'revise', 'reject'].map((filterOption) => (
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

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#202538] mb-2">{review.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{review.applicant}</p>
                    <p className="text-sm text-gray-500">{review.institution}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRecommendationColor(review.recommendation)}`}>
                      {review.recommendation}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className={`text-lg font-bold ${getScoreColor(review.averageScore)}`}>
                        {review.averageScore}/5
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scores Breakdown */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {Object.entries(review.scores).map(([criterion, score]) => (
                    <div key={criterion} className="text-center">
                      <p className="text-xs text-gray-600 capitalize mb-1">
                        {criterion.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
                        {score}/5
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comments Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Review Comments</h4>
                  <p className="text-sm text-gray-700 line-clamp-3">{review.comments}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>Submitted: {review.submissionDate}</span>
                    <span>Reviewed: {review.reviewDate}</span>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/reviewer/review/${review.id}`}
                      className="text-[#05585F] hover:text-[#00A29D] font-medium"
                    >
                      View Full Review
                    </Link>
                    <button className="text-gray-600 hover:text-gray-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed reviews</h3>
              <p className="text-gray-600">You haven't completed any reviews yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
