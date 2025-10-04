// Enhanced Reviewer Matching Component
// Uses scholar profiles and LLM analysis for intelligent reviewer matching

import { useState, useEffect } from 'react'
import type { Reviewer } from '../services/localDatabase'
import { localDatabase } from '../services/localDatabase'

interface EnhancedReviewerMatchingProps {
  applicationId: string
  onReviewerSelect?: (reviewer: Reviewer) => void
}

interface ScoredReviewer extends Reviewer {
  matchScore: number
  matchReasons: string[]
}

export default function EnhancedReviewerMatching({ 
  applicationId, 
  onReviewerSelect 
}: EnhancedReviewerMatchingProps) {
  const [recommendedReviewers, setRecommendedReviewers] = useState<ScoredReviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendedReviewers()
  }, [applicationId])

  const loadRecommendedReviewers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const reviewers = await localDatabase.getRecommendedReviewers(applicationId)
      const scoredReviewers = reviewers.map(reviewer => ({
        ...reviewer,
        matchReasons: generateMatchReasons(reviewer)
      }))

      setRecommendedReviewers(scoredReviewers)
    } catch (err) {
      setError('Failed to load recommended reviewers')
      console.error('Error loading reviewers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMatchReasons = (reviewer: Reviewer): string[] => {
    const reasons: string[] = []
    
    if (reviewer.msRelevance >= 80) {
      reasons.push('High MS research relevance')
    }
    
    if (reviewer.reputationScore >= 80) {
      reasons.push('Strong academic reputation')
    }
    
    if (reviewer.availability === 'available') {
      reasons.push('Currently available')
    }
    
    if (reviewer.hIndex >= 40) {
      reasons.push('High h-index')
    }
    
    if (reviewer.last5yPubs >= 10) {
      reasons.push('Active recent publications')
    }
    
    return reasons
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#05585F] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading recommended reviewers...</span>
        </div>
      </div>
    )
  }

  if (error || recommendedReviewers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">{error || 'No recommended reviewers available'}</p>
          <button 
            onClick={loadRecommendedReviewers}
            className="mt-2 text-[#05585F] hover:text-[#00A29D] text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI-Enhanced Reviewer Matching</h3>
        <div className="text-sm text-gray-500">
          Based on scholar profiles and LLM analysis
        </div>
      </div>

      <div className="space-y-4">
        {recommendedReviewers.map((reviewer) => (
          <div key={reviewer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">{reviewer.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(reviewer.availability)}`}>
                    {reviewer.availability}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Match Score:</span>
                    <span className={`text-lg font-bold ${getMatchScoreColor(reviewer.matchScore)}`}>
                      {Math.round(reviewer.matchScore)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{reviewer.institution}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">H-Index:</span>
                    <span className="ml-1 font-medium">{reviewer.hIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Citations:</span>
                    <span className="ml-1 font-medium">{reviewer.totalCitations.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">MS Relevance:</span>
                    <span className="ml-1 font-medium">{reviewer.msRelevance}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reputation:</span>
                    <span className="ml-1 font-medium">{reviewer.reputationScore}%</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onReviewerSelect?.(reviewer)}
                className="ml-4 bg-[#05585F] text-white px-4 py-2 rounded-lg hover:bg-[#00A29D] transition text-sm font-medium"
              >
                Select
              </button>
            </div>

            {/* Match Reasons */}
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Match Reasons:</h5>
              <div className="flex flex-wrap gap-2">
                {reviewer.matchReasons.map((reason, reasonIndex) => (
                  <span 
                    key={reasonIndex}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* Expertise Areas */}
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Expertise:</h5>
              <div className="flex flex-wrap gap-2">
                {reviewer.expertise.map((area, areaIndex) => (
                  <span 
                    key={areaIndex}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Research Topics:</h5>
              <div className="flex flex-wrap gap-2">
                {reviewer.topics.map((topic, topicIndex) => (
                  <span 
                    key={topicIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#05585F]">
              {recommendedReviewers.length}
            </div>
            <div className="text-gray-600">Recommended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendedReviewers.filter(r => r.availability === 'available').length}
            </div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(recommendedReviewers.reduce((sum, r) => sum + r.matchScore, 0) / recommendedReviewers.length)}%
            </div>
            <div className="text-gray-600">Avg Match Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}
