// Scholar Profile Card Component
// Displays comprehensive academic profile with LLM analysis

import { useState, useEffect } from 'react'
import type { ScholarProfile, NewsProfile } from '../services/scholarService'
import { scholarService } from '../services/scholarService'
import { localDatabase } from '../services/localDatabase'

interface ScholarProfileCardProps {
  applicationId: string
  onProfileUpdate?: (profile: ScholarProfile) => void
}

export default function ScholarProfileCard({ applicationId, onProfileUpdate }: ScholarProfileCardProps) {
  const [profile, setProfile] = useState<ScholarProfile | null>(null)
  const [newsProfile, setNewsProfile] = useState<NewsProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [applicationId])

  const loadProfiles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch scholar profile
      const scholarProfile = await localDatabase.fetchScholarProfile(applicationId)
      if (scholarProfile) {
        setProfile(scholarProfile)
        onProfileUpdate?.(scholarProfile)
      }

      // Fetch news profile
      const news = await localDatabase.fetchNewsProfile(applicationId)
      if (news) {
        setNewsProfile(news)
      }
    } catch (err) {
      setError('Failed to load scholar profile')
      console.error('Error loading profiles:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const _getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMSRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#05585F] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading scholar profile...</span>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">{error || 'No scholar profile available'}</p>
          <button 
            onClick={loadProfiles}
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
        <h3 className="text-lg font-semibold text-gray-900">Academic Profile</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm text-gray-900">
            {new Date(profile.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="text-sm font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Institution:</span>
              <span className="text-sm font-medium">{profile.institution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium">{profile.email}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Academic Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">H-Index:</span>
              <span className="text-sm font-medium">{profile.hIndex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Citations:</span>
              <span className="text-sm font-medium">{profile.totalCitations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last 5Y Publications:</span>
              <span className="text-sm font-medium">{profile.last5yPubs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reputation & MS Relevance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Reputation Score</h4>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-[#05585F]">
              {Math.round(profile.reputationScore)}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#05585F] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profile.reputationScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Based on h-index, citations, and recent publications
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">MS Relevance</h4>
          <div className="flex items-center space-x-3">
            <div className={`text-3xl font-bold ${getMSRelevanceColor(profile.msRelevance)}`}>
              {Math.round(profile.msRelevance)}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    profile.msRelevance >= 80 ? 'bg-green-500' :
                    profile.msRelevance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profile.msRelevance}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Relevance to multiple sclerosis research
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Expertise Areas</h4>
        <div className="flex flex-wrap gap-2">
          {profile.expertise.map((area, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-[#05585F] text-white text-sm rounded-full"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Publications */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Recent Publications</h4>
        <div className="space-y-3">
          {profile.recentPublications.slice(0, 3).map((pub, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-sm text-gray-900 mb-1">{pub.title}</h5>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>{pub.journal}</span>
                <span>{pub.year}</span>
                <span>{pub.citations} citations</span>
                <span className={`px-2 py-1 rounded ${
                  pub.msRelevance >= 80 ? 'bg-green-100 text-green-800' :
                  pub.msRelevance >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pub.msRelevance}% MS relevance
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Profile */}
      {newsProfile && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Media Profile</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mentions:</span>
                <span className="ml-2 font-medium">{newsProfile.mentions}</span>
              </div>
              <div>
                <span className="text-gray-600">Sentiment:</span>
                <span className={`ml-2 font-medium ${
                  newsProfile.mediaSentiment === 'positive' ? 'text-green-600' :
                  newsProfile.mediaSentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {newsProfile.mediaSentiment}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Risk Flags:</span>
                <span className="ml-2 font-medium">
                  {newsProfile.riskFlags.length > 0 ? newsProfile.riskFlags.length : 'None'}
                </span>
              </div>
            </div>
            
            {newsProfile.riskFlags.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-medium text-red-900 mb-2">Risk Flags:</h5>
                <ul className="text-sm text-red-800 space-y-1">
                  {newsProfile.riskFlags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collaboration Network */}
      {profile.collaborationNetwork.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Collaboration Network</h4>
          <div className="flex flex-wrap gap-2">
            {profile.collaborationNetwork.map((collaborator, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {collaborator}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Funding History */}
      {profile.fundingHistory.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Funding History</h4>
          <div className="space-y-2">
            {profile.fundingHistory.slice(0, 3).map((funding, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-sm text-gray-900">{funding.title}</h5>
                    <p className="text-xs text-gray-600">{funding.agency} • {funding.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${funding.amount.toLocaleString()}</p>
                    <p className={`text-xs ${
                      funding.status === 'completed' ? 'text-green-600' :
                      funding.status === 'ongoing' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {funding.status}
                    </p>
                  </div>
                </div>
                {funding.msRelated && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    MS Related
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
