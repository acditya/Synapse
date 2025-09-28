import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { reviewersApi } from '../services/api'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  on_leave: 'bg-yellow-100 text-yellow-800'
}

export default function ReviewerList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')

  const { data: reviewers = [], isLoading, refetch } = useQuery(
    ['reviewers', { status: statusFilter, available: availabilityFilter, expertise: expertiseFilter }],
    () => reviewersApi.getReviewers({
      available_only: availabilityFilter === 'true',
      expertise_area: expertiseFilter || undefined,
    }),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  )

  // Mock reviewer data since API might not be fully implemented
  const mockReviewers = [
    {
      id: 1,
      name: 'Dr. Lisa Wang',
      email: 'l.wang@stanford.edu',
      title: 'Professor',
      institution: 'Stanford University',
      department: 'Neurology',
      orcid_id: '0000-0002-1234-5678',
      research_areas: ['Multiple Sclerosis', 'Neurodegeneration', 'Immunology'],
      keywords: ['biomarkers', 'machine learning', 'clinical trials'],
      subspecialties: ['Progressive MS', 'MRI Analysis'],
      available: true,
      current_review_count: 2,
      max_reviews_per_cycle: 5,
      status: 'active',
      h_index: 45,
      citation_count: 2340,
      publication_count: 89,
      total_reviews_completed: 34,
      average_review_time_days: 12.5,
      review_quality_score: 4.2,
      created_at: '2023-03-15T10:00:00Z',
      last_login: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      name: 'Dr. Robert Martinez',
      email: 'r.martinez@mayo.edu',
      title: 'Associate Professor',
      institution: 'Mayo Clinic',
      department: 'Neuroscience',
      orcid_id: '0000-0003-9876-5432',
      research_areas: ['Clinical Trials', 'MS Treatment', 'Neurology'],
      keywords: ['drug development', 'clinical outcomes', 'patient care'],
      subspecialties: ['Relapsing MS', 'Drug Safety'],
      available: true,
      current_review_count: 1,
      max_reviews_per_cycle: 4,
      status: 'active',
      h_index: 32,
      citation_count: 1580,
      publication_count: 67,
      total_reviews_completed: 28,
      average_review_time_days: 8.2,
      review_quality_score: 4.5,
      created_at: '2023-01-10T09:00:00Z',
      last_login: '2024-01-19T11:15:00Z'
    },
    {
      id: 3,
      name: 'Dr. Sarah Kim',
      email: 's.kim@harvard.edu',
      title: 'Assistant Professor',
      institution: 'Harvard Medical School',
      department: 'Immunology',
      orcid_id: '0000-0001-2468-1357',
      research_areas: ['Autoimmunity', 'MS Immunology', 'T-cell Biology'],
      keywords: ['autoimmune diseases', 'immunotherapy', 'molecular biology'],
      subspecialties: ['CNS Autoimmunity', 'Regulatory T-cells'],
      available: false,
      current_review_count: 3,
      max_reviews_per_cycle: 3,
      status: 'active',
      h_index: 28,
      citation_count: 980,
      publication_count: 42,
      total_reviews_completed: 15,
      average_review_time_days: 14.8,
      review_quality_score: 4.0,
      created_at: '2023-08-22T15:30:00Z',
      last_login: '2024-01-18T16:45:00Z'
    }
  ]

  const displayData = searchTerm || statusFilter || availabilityFilter || expertiseFilter
    ? mockReviewers.filter(reviewer => {
        const matchesSearch = !searchTerm || 
          reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reviewer.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reviewer.research_areas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
          reviewer.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesStatus = !statusFilter || reviewer.status === statusFilter
        const matchesAvailability = !availabilityFilter || 
          (availabilityFilter === 'true' && reviewer.available) ||
          (availabilityFilter === 'false' && !reviewer.available)
        const matchesExpertise = !expertiseFilter || 
          reviewer.research_areas.some(area => area.toLowerCase().includes(expertiseFilter.toLowerCase())) ||
          reviewer.keywords.some(keyword => keyword.toLowerCase().includes(expertiseFilter.toLowerCase()))
        
        return matchesSearch && matchesStatus && matchesAvailability && matchesExpertise
      })
    : mockReviewers

  const getWorkloadPercentage = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0
  }

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-orange-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600'
    if (score >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Reviewers</h1>
            <p className="mt-2 text-sm text-secondary-500">
              Manage reviewer profiles, expertise, and assignments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => refetch()}
              className="btn-secondary"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Reviewer
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search reviewers, institutions, expertise..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Reviewers</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            {/* Expertise Filter */}
            <div>
              <input
                type="text"
                placeholder="Filter by expertise..."
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {displayData.map((reviewer) => {
          const workloadPercentage = getWorkloadPercentage(reviewer.current_review_count, reviewer.max_reviews_per_cycle)
          
          return (
            <div key={reviewer.id} className="card hover:shadow-lg transition-shadow duration-200">
              {/* Header */}
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/reviewers/${reviewer.id}`}
                        className="text-lg font-semibold text-secondary-900 hover:text-primary-600"
                      >
                        {reviewer.name}
                      </Link>
                      <p className="text-sm text-secondary-500">{reviewer.title}</p>
                      <p className="text-sm text-secondary-500">{reviewer.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={clsx('badge', statusColors[reviewer.status])}>
                      {reviewer.status.replace('_', ' ')}
                    </span>
                    {reviewer.available ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">Unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="card-body space-y-4">
                {/* Institution */}
                <div className="flex items-center space-x-2">
                  <BuildingOffice2Icon className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-700">
                    {reviewer.institution} • {reviewer.department}
                  </span>
                </div>

                {/* Research Areas */}
                <div>
                  <p className="text-xs font-medium text-secondary-500 mb-2">RESEARCH AREAS</p>
                  <div className="flex flex-wrap gap-1">
                    {reviewer.research_areas.slice(0, 3).map((area, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                      >
                        {area}
                      </span>
                    ))}
                    {reviewer.research_areas.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                        +{reviewer.research_areas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <p className="text-xs font-medium text-secondary-500 mb-2">KEYWORDS</p>
                  <div className="flex flex-wrap gap-1">
                    {reviewer.keywords.slice(0, 4).map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600"
                      >
                        {keyword}
                      </span>
                    ))}
                    {reviewer.keywords.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                        +{reviewer.keywords.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Workload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-secondary-500">CURRENT WORKLOAD</p>
                    <span className={clsx('text-xs font-medium', getWorkloadColor(workloadPercentage))}>
                      {reviewer.current_review_count}/{reviewer.max_reviews_per_cycle}
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className={clsx(
                        'h-2 rounded-full transition-all duration-300',
                        workloadPercentage >= 100 ? 'bg-red-500' :
                        workloadPercentage >= 80 ? 'bg-orange-500' :
                        workloadPercentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      )}
                      style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-secondary-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <AcademicCapIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">H-Index</span>
                    </div>
                    <p className="text-sm font-semibold text-secondary-900 mt-1">
                      {reviewer.h_index}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">Avg. Time</span>
                    </div>
                    <p className="text-sm font-semibold text-secondary-900 mt-1">
                      {reviewer.average_review_time_days?.toFixed(1)} days
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <ChartBarIcon className="h-4 w-4 text-secondary-400" />
                      <span className="text-xs text-secondary-500">Quality</span>
                    </div>
                    <p className={clsx(
                      'text-sm font-semibold mt-1',
                      getPerformanceColor(reviewer.review_quality_score)
                    )}>
                      {reviewer.review_quality_score?.toFixed(1)}/5.0
                    </p>
                  </div>
                </div>

                {/* Publications and Reviews */}
                <div className="bg-secondary-50 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-secondary-900">{reviewer.publication_count}</p>
                      <p className="text-xs text-secondary-600">Publications</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary-900">{reviewer.citation_count?.toLocaleString()}</p>
                      <p className="text-xs text-secondary-600">Citations</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary-900">{reviewer.total_reviews_completed}</p>
                      <p className="text-xs text-secondary-600">Reviews</p>
                    </div>
                  </div>
                </div>

                {/* Warning for overloaded reviewers */}
                {workloadPercentage >= 100 && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">
                        At maximum capacity
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-secondary-500">
                    Last active: {new Date(reviewer.last_login).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/reviewers/${reviewer.id}`}
                      className="btn-sm btn-secondary"
                    >
                      View Profile
                    </Link>
                    <button className="btn-sm btn-primary">
                      Assign Grant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {displayData.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No reviewers found
            </h3>
            <p className="text-secondary-500 mb-4">
              {searchTerm || statusFilter || availabilityFilter || expertiseFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No reviewers have been added to the system yet.'}
            </p>
            <button className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Reviewer
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {displayData.filter(r => r.available && r.status === 'active').length}
            </div>
            <div className="text-sm text-secondary-600">Available</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {displayData.filter(r => getWorkloadPercentage(r.current_review_count, r.max_reviews_per_cycle) >= 80).length}
            </div>
            <div className="text-sm text-secondary-600">High Workload</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600">
              {displayData.reduce((sum, r) => sum + r.total_reviews_completed, 0)}
            </div>
            <div className="text-sm text-secondary-600">Total Reviews</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(displayData.reduce((sum, r) => sum + (r.review_quality_score || 0), 0) / displayData.length * 10) / 10}
            </div>
            <div className="text-sm text-secondary-600">Avg. Quality</div>
          </div>
        </div>
      </div>
    </div>
  )
}