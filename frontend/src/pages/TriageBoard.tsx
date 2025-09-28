import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { triageApi, grantsApi } from '../services/api'

const statusColors = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function TriageBoard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const { data: triageRecords = [], isLoading, refetch } = useQuery(
    ['triage-records', { status: statusFilter, search: searchTerm }],
    () => triageApi.getTriageRecords({
      status: statusFilter || undefined,
      // In a real implementation, you'd handle search on backend
    }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  const { data: grants = [] } = useQuery('grants', () => grantsApi.getGrants())

  // Mock triage data since API might not be fully implemented
  const mockTriageData = [
    {
      id: 1,
      grant_id: 1,
      reviewer_id: 1,
      status: 'assigned',
      priority: 'high',
      due_date: '2024-02-15T00:00:00Z',
      assignment_date: '2024-01-15T10:30:00Z',
      overall_match_score: 0.85,
      grant: {
        id: 1,
        title: 'Multiple Sclerosis Biomarker Discovery Using Machine Learning',
        principal_investigator: 'Dr. Sarah Johnson',
        budget_requested: 250000
      },
      reviewer: {
        id: 1,
        name: 'Dr. Lisa Wang',
        institution: 'Stanford University'
      }
    },
    {
      id: 2,
      grant_id: 2,
      reviewer_id: 2,
      status: 'in_progress',
      priority: 'medium',
      due_date: '2024-02-10T00:00:00Z',
      assignment_date: '2024-01-10T14:20:00Z',
      overall_match_score: 0.92,
      grant: {
        id: 2,
        title: 'Novel Therapeutic Targets for Progressive MS',
        principal_investigator: 'Dr. Michael Chen',
        budget_requested: 180000
      },
      reviewer: {
        id: 2,
        name: 'Dr. Robert Martinez',
        institution: 'Medical Center'
      }
    },
    {
      id: 3,
      grant_id: 3,
      reviewer_id: null,
      status: 'assigned',
      priority: 'urgent',
      due_date: '2024-01-30T00:00:00Z',
      assignment_date: null,
      overall_match_score: null,
      grant: {
        id: 3,
        title: 'Stem Cell Therapy for MS Remyelination',
        principal_investigator: 'Dr. Emily Rodriguez',
        budget_requested: 350000
      },
      reviewer: null
    }
  ]

  const displayData = searchTerm || statusFilter || priorityFilter 
    ? mockTriageData.filter(record => {
        const matchesSearch = !searchTerm || 
          record.grant?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.grant?.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.reviewer?.name.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = !statusFilter || record.status === statusFilter
        const matchesPriority = !priorityFilter || record.priority === priorityFilter
        
        return matchesSearch && matchesStatus && matchesPriority
      })
    : mockTriageData

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Triage Board</h1>
            <p className="mt-2 text-sm text-secondary-500">
              Manage grant review assignments and track progress
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search grants, investigators, or reviewers..."
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
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
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
          </div>
        </div>
      </div>

      {/* Triage Records */}
      <div className="space-y-4">
        {displayData.map((record) => {
          const daysRemaining = getDaysRemaining(record.due_date)
          const isOverdue = daysRemaining !== null && daysRemaining < 0
          const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0

          return (
            <div
              key={record.id}
              className={clsx(
                'card hover:shadow-md transition-shadow duration-200',
                isOverdue && 'border-l-4 border-l-red-500',
                isUrgent && 'border-l-4 border-l-orange-500'
              )}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Grant Info */}
                    <div className="flex items-start space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-secondary-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <Link
                          to={`/grants/${record.grant?.id}`}
                          className="text-lg font-medium text-secondary-900 hover:text-primary-600"
                        >
                          {record.grant?.title}
                        </Link>
                        <p className="text-sm text-secondary-500 mt-1">
                          PI: {record.grant?.principal_investigator} • 
                          Budget: ${record.grant?.budget_requested?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Reviewer Info */}
                    <div className="flex items-center space-x-3 mt-3">
                      <UserIcon className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                      <div>
                        {record.reviewer ? (
                          <>
                            <Link
                              to={`/reviewers/${record.reviewer.id}`}
                              className="text-sm font-medium text-secondary-900 hover:text-primary-600"
                            >
                              {record.reviewer.name}
                            </Link>
                            <p className="text-xs text-secondary-500">
                              {record.reviewer.institution}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-secondary-500">
                            No reviewer assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    {record.due_date && (
                      <div className="flex items-center space-x-3 mt-3">
                        <ClockIcon className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-secondary-700">Due: </span>
                          <span className={clsx(
                            isOverdue && 'text-red-600 font-medium',
                            isUrgent && 'text-orange-600 font-medium',
                            !isOverdue && !isUrgent && 'text-secondary-500'
                          )}>
                            {new Date(record.due_date).toLocaleDateString()}
                            {daysRemaining !== null && (
                              <span className="ml-2">
                                ({isOverdue 
                                  ? `${Math.abs(daysRemaining)} days overdue`
                                  : `${daysRemaining} days remaining`
                                })
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <span className={clsx('badge', statusColors[record.status])}>
                        {record.status.replace('_', ' ')}
                      </span>
                      <span className={clsx('badge', priorityColors[record.priority])}>
                        {record.priority}
                      </span>
                    </div>

                    {record.overall_match_score && (
                      <div className="text-xs text-secondary-500">
                        Match: {Math.round(record.overall_match_score * 100)}%
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {!record.reviewer && (
                        <button className="btn-sm btn-primary">
                          Assign Reviewer
                        </button>
                      )}
                      <Link
                        to={`/grants/${record.grant?.id}`}
                        className="btn-sm btn-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Progress indicators */}
                {record.status === 'in_progress' && (
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>Review in progress...</span>
                    </div>
                  </div>
                )}

                {isOverdue && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>Review is overdue. Consider sending reminder or reassigning.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {displayData.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No triage records found
              </h3>
              <p className="text-secondary-500">
                {searchTerm || statusFilter || priorityFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no grants currently in the triage system.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600">
              {displayData.filter(r => r.status === 'assigned').length}
            </div>
            <div className="text-sm text-secondary-600">Assigned</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {displayData.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-secondary-600">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {displayData.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-secondary-600">Completed</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-red-600">
              {displayData.filter(r => getDaysRemaining(r.due_date) !== null && getDaysRemaining(r.due_date)! < 0).length}
            </div>
            <div className="text-sm text-secondary-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  )
}