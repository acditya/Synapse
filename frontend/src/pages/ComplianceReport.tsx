import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { complianceApi } from '../services/api'

const statusColors = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  manual_review: 'bg-purple-100 text-purple-800'
}

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

export default function ComplianceReport() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data: complianceChecks = [], isLoading } = useQuery(
    ['compliance-checks', { status: statusFilter, severity: severityFilter, type: typeFilter }],
    () => complianceApi.getAllCompliance({
      status: statusFilter || undefined,
      severity: severityFilter || undefined,
      check_type: typeFilter || undefined,
    }),
    {
      refetchInterval: 30000,
    }
  )

  const { data: summary } = useQuery(
    'compliance-summary',
    () => complianceApi.getComplianceSummary(),
    {
      refetchInterval: 30000,
    }
  )

  // Mock data for demonstration
  const mockSummary = {
    status_counts: {
      passed: 156,
      failed: 23,
      warning: 45,
      pending: 12,
      manual_review: 8
    },
    severity_counts: {
      low: 89,
      medium: 98,
      high: 34,
      critical: 23
    },
    type_counts: {
      eligibility: 67,
      policy_adherence: 54,
      irb_compliance: 43,
      budget_validation: 45,
      administrative_requirements: 35
    },
    manual_review_pending: 8,
    high_risk_findings: 23,
    average_compliance_score: 0.76,
    total_checks: 244
  }

  const mockChecks = [
    {
      id: 1,
      grant_id: 1,
      check_type: 'eligibility',
      check_name: 'NMSS Eligibility Check',
      status: 'passed',
      severity: 'low',
      score: 0.85,
      confidence: 0.92,
      findings: ['Grant demonstrates clear relevance to MS research'],
      violations: [],
      recommendations: [],
      created_at: '2024-01-15T10:30:00Z',
      grant: {
        id: 1,
        title: 'Multiple Sclerosis Biomarker Discovery Using Machine Learning',
        principal_investigator: 'Dr. Sarah Johnson'
      }
    },
    {
      id: 2,
      grant_id: 2,
      check_type: 'irb_compliance',
      check_name: 'IRB/Ethics Compliance Check',
      status: 'failed',
      severity: 'critical',
      score: 0.2,
      confidence: 0.95,
      findings: ['Human subjects research detected without clear IRB approval'],
      violations: ['Human subjects research requires IRB approval'],
      recommendations: ['Obtain IRB approval before research initiation'],
      created_at: '2024-01-10T14:20:00Z',
      grant: {
        id: 2,
        title: 'Novel Therapeutic Targets for Progressive MS',
        principal_investigator: 'Dr. Michael Chen'
      }
    },
    {
      id: 3,
      grant_id: 3,
      check_type: 'budget_validation',
      check_name: 'Budget Validation Check',
      status: 'warning',
      severity: 'medium',
      score: 0.65,
      confidence: 0.78,
      findings: ['High budget amount requires additional justification'],
      violations: [],
      recommendations: ['Provide detailed budget justification for high-cost items'],
      created_at: '2024-01-05T09:00:00Z',
      grant: {
        id: 3,
        title: 'Stem Cell Therapy for MS Remyelination',
        principal_investigator: 'Dr. Emily Rodriguez'
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Compliance Report</h1>
            <p className="mt-2 text-sm text-secondary-500">
              Monitor grant compliance with NMSS policies and requirements
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="btn-primary">
              Run Batch Check
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Passed Checks
                  </dt>
                  <dd className="text-2xl font-semibold text-secondary-900">
                    {mockSummary.status_counts.passed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    High Risk Issues
                  </dt>
                  <dd className="text-2xl font-semibold text-secondary-900">
                    {mockSummary.high_risk_findings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Manual Review
                  </dt>
                  <dd className="text-2xl font-semibold text-secondary-900">
                    {mockSummary.manual_review_pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Avg. Score
                  </dt>
                  <dd className="text-2xl font-semibold text-secondary-900">
                    {Math.round(mockSummary.average_compliance_score * 100)}%
                  </dd>
                </dl>
              </div>
            </div>
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
                  placeholder="Search checks, grants, investigators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
                <option value="pending">Pending</option>
                <option value="manual_review">Manual Review</option>
              </select>
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="eligibility">Eligibility</option>
                <option value="policy_adherence">Policy</option>
                <option value="irb_compliance">IRB</option>
                <option value="budget_validation">Budget</option>
                <option value="administrative_requirements">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        {mockChecks.map((check) => (
          <div key={check.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <ShieldCheckIcon className="h-5 w-5 text-secondary-400" />
                    <h3 className="text-lg font-medium text-secondary-900">
                      {check.check_name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <Link
                      to={`/grants/${check.grant_id}`}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      {check.grant?.title}
                    </Link>
                    <span className="text-sm text-secondary-500">
                      by {check.grant?.principal_investigator}
                    </span>
                  </div>

                  {/* Findings */}
                  {check.findings && check.findings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-secondary-500 mb-1">FINDINGS</p>
                      <ul className="space-y-1">
                        {check.findings.map((finding, index) => (
                          <li key={index} className="text-sm text-secondary-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Violations */}
                  {check.violations && check.violations.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-red-600 mb-1">VIOLATIONS</p>
                      <ul className="space-y-1">
                        {check.violations.map((violation, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start">
                            <XCircleIcon className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            {violation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {check.recommendations && check.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">RECOMMENDATIONS</p>
                      <ul className="space-y-1">
                        {check.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex space-x-2">
                    <span className={clsx('badge', statusColors[check.status])}>
                      {check.status.replace('_', ' ')}
                    </span>
                    <span className={clsx('badge', severityColors[check.severity])}>
                      {check.severity}
                    </span>
                  </div>

                  {check.score !== null && (
                    <div className="text-sm text-secondary-600">
                      Score: {Math.round(check.score * 100)}%
                    </div>
                  )}

                  {check.confidence && (
                    <div className="text-xs text-secondary-500">
                      Confidence: {Math.round(check.confidence * 100)}%
                    </div>
                  )}

                  <div className="text-xs text-secondary-400">
                    {new Date(check.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {mockChecks.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <ShieldCheckIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No compliance checks found
            </h3>
            <p className="text-secondary-500">
              No compliance checks match your current filters.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}