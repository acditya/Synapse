import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { grantsApi } from '../services/api'

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function BriefView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const { data: grants = [], isLoading, refetch } = useQuery(
    ['grants', { status: statusFilter, search: searchTerm, sort: sortBy, order: sortOrder }],
    () => grantsApi.getGrants({
      status: statusFilter || undefined,
      // In a real implementation, you'd handle search, sort on backend
    }),
    {
      refetchInterval: 30000,
    }
  )

  // Mock grant data since API might not be fully implemented
  const mockGrants = [
    {
      id: 1,
      title: 'Multiple Sclerosis Biomarker Discovery Using Machine Learning',
      principal_investigator: 'Dr. Sarah Johnson',
      pi_email: 's.johnson@university.edu',
      pi_institution: 'University Medical Center',
      budget_requested: 250000,
      duration_months: 24,
      status: 'submitted',
      priority: 'high',
      eligibility_score: 0.85,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      upload_date: '2024-01-15T10:30:00Z',
      compliance_flags: [],
      abstract: 'This study aims to identify novel biomarkers for multiple sclerosis progression using advanced machine learning techniques...',
      keywords: ['machine learning', 'biomarkers', 'multiple sclerosis', 'progression'],
      ai_summary: 'High-impact research proposal focusing on ML-based biomarker discovery for MS progression monitoring.'
    },
    {
      id: 2,
      title: 'Novel Therapeutic Targets for Progressive MS',
      principal_investigator: 'Dr. Michael Chen',
      pi_email: 'm.chen@research.org',
      pi_institution: 'Research Institute',
      budget_requested: 180000,
      duration_months: 18,
      status: 'under_review',
      priority: 'medium',
      eligibility_score: 0.92,
      created_at: '2024-01-10T14:20:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      upload_date: '2024-01-10T14:20:00Z',
      compliance_flags: ['budget_high'],
      abstract: 'Investigation of novel molecular targets for treating progressive forms of multiple sclerosis through innovative therapeutic approaches...',
      keywords: ['therapeutic targets', 'progressive MS', 'drug development'],
      ai_summary: 'Promising therapeutic development project with strong potential for clinical translation.'
    },
    {
      id: 3,
      title: 'Stem Cell Therapy for MS Remyelination',
      principal_investigator: 'Dr. Emily Rodriguez',
      pi_email: 'e.rodriguez@stemcell.edu',
      pi_institution: 'Stem Cell Research Center',
      budget_requested: 350000,
      duration_months: 36,
      status: 'approved',
      priority: 'urgent',
      eligibility_score: 0.94,
      created_at: '2024-01-05T09:00:00Z',
      updated_at: '2024-01-08T16:45:00Z',
      upload_date: '2024-01-05T09:00:00Z',
      compliance_flags: [],
      abstract: 'Development of stem cell-based therapeutic approaches for promoting remyelination in multiple sclerosis patients...',
      keywords: ['stem cells', 'remyelination', 'therapy', 'MS treatment'],
      ai_summary: 'Cutting-edge stem cell research with excellent potential for breakthrough MS treatment.'
    }
  ]

  const displayData = searchTerm || statusFilter || priorityFilter 
    ? mockGrants.filter(grant => {
        const matchesSearch = !searchTerm || 
          grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grant.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grant.pi_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grant.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesStatus = !statusFilter || grant.status === statusFilter
        const matchesPriority = !priorityFilter || grant.priority === priorityFilter
        
        return matchesSearch && matchesStatus && matchesPriority
      })
    : mockGrants

  const getEligibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEligibilityLabel = (score: number) => {
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Brief View</h1>
            <p className="mt-2 text-sm text-secondary-500">
              Quick overview of all grant proposals with key information
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => refetch()}
              className="btn-secondary"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <Link to="/upload" className="btn-primary">
              Upload Grant
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            {/* Search */}
            <div className="sm:col-span-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search grants, investigators, institutions, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="form-select"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="budget_requested-desc">Highest Budget</option>
                <option value="budget_requested-asc">Lowest Budget</option>
                <option value="eligibility_score-desc">Highest Eligibility</option>
                <option value="eligibility_score-asc">Lowest Eligibility</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grant Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {displayData.map((grant) => (
          <div key={grant.id} className="card hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/grants/${grant.id}`}
                    className="text-lg font-semibold text-secondary-900 hover:text-primary-600 line-clamp-2"
                  >
                    {grant.title}
                  </Link>
                  <p className="text-sm text-secondary-500 mt-1">
                    Grant ID: #{grant.id}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1 ml-4">
                  <span className={clsx('badge', statusColors[grant.status])}>
                    {grant.status.replace('_', ' ')}
                  </span>
                  <span className={clsx('badge', priorityColors[grant.priority])}>
                    {grant.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="card-body space-y-4">
              {/* PI and Institution */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm font-medium text-secondary-900">
                    {grant.principal_investigator}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BuildingOffice2Icon className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">
                    {grant.pi_institution}
                  </span>
                </div>
              </div>

              {/* Abstract Preview */}
              {grant.abstract && (
                <div>
                  <p className="text-sm text-secondary-700 line-clamp-3">
                    {grant.abstract}
                  </p>
                </div>
              )}

              {/* AI Summary */}
              {grant.ai_summary && (
                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <ChartBarIcon className="h-4 w-4 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-primary-700 mb-1">AI Summary</p>
                      <p className="text-sm text-primary-800">{grant.ai_summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {grant.keywords && grant.keywords.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {grant.keywords.slice(0, 4).map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700"
                      >
                        {keyword}
                      </span>
                    ))}
                    {grant.keywords.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                        +{grant.keywords.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-secondary-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-secondary-400" />
                    <span className="text-xs text-secondary-500">Budget</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 mt-1">
                    ${grant.budget_requested?.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <CalendarDaysIcon className="h-4 w-4 text-secondary-400" />
                    <span className="text-xs text-secondary-500">Duration</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 mt-1">
                    {grant.duration_months} months
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <ChartBarIcon className="h-4 w-4 text-secondary-400" />
                    <span className="text-xs text-secondary-500">Eligibility</span>
                  </div>
                  <p className={clsx(
                    'text-sm font-semibold mt-1',
                    getEligibilityColor(grant.eligibility_score)
                  )}>
                    {getEligibilityLabel(grant.eligibility_score)} ({Math.round(grant.eligibility_score * 100)}%)
                  </p>
                </div>
              </div>

              {/* Compliance Flags */}
              {grant.compliance_flags && grant.compliance_flags.length > 0 && (
                <div className="bg-warning-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-warning-700 mb-1">
                    Compliance Issues ({grant.compliance_flags.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {grant.compliance_flags.map((flag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800"
                      >
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="card-footer">
              <div className="flex items-center justify-between">
                <div className="text-xs text-secondary-500">
                  Submitted {new Date(grant.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/grants/${grant.id}`}
                    className="btn-sm btn-secondary"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayData.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No grants found
            </h3>
            <p className="text-secondary-500 mb-4">
              {searchTerm || statusFilter || priorityFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No grant proposals have been submitted yet.'}
            </p>
            <Link to="/upload" className="btn-primary">
              Upload First Grant
            </Link>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600">
              {displayData.filter(g => g.status === 'submitted').length}
            </div>
            <div className="text-sm text-secondary-600">Submitted</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {displayData.filter(g => g.status === 'under_review').length}
            </div>
            <div className="text-sm text-secondary-600">Under Review</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {displayData.filter(g => g.status === 'approved').length}
            </div>
            <div className="text-sm text-secondary-600">Approved</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {displayData.reduce((sum, g) => sum + (g.budget_requested || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-secondary-600">Total Budget ($)</div>
          </div>
        </div>
      </div>
    </div>
  )
}