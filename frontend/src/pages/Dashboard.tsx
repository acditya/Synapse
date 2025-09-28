import React from 'react'
import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useQuery } from 'react-query'
import { api } from '../services/api'

const stats = [
  {
    name: 'Total Grants',
    value: '124',
    change: '+12%',
    changeType: 'increase' as const,
    icon: DocumentTextIcon,
    href: '/brief'
  },
  {
    name: 'Active Reviews',
    value: '23',
    change: '+4.3%',
    changeType: 'increase' as const,
    icon: ClockIcon,
    href: '/triage'
  },
  {
    name: 'Available Reviewers',
    value: '45',
    change: '-2.1%',
    changeType: 'decrease' as const,
    icon: UserGroupIcon,
    href: '/reviewers'
  },
  {
    name: 'Compliance Issues',
    value: '8',
    change: '-12%',
    changeType: 'decrease' as const,
    icon: ExclamationTriangleIcon,
    href: '/compliance'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'grant_submitted',
    title: 'New grant submitted',
    description: 'Multiple Sclerosis Biomarker Discovery by Dr. Sarah Johnson',
    time: '2 hours ago',
    icon: DocumentTextIcon,
    iconColor: 'text-blue-600',
    href: '/grants/123'
  },
  {
    id: 2,
    type: 'review_completed',
    title: 'Review completed',
    description: 'Dr. Michael Chen completed review for Grant #118',
    time: '4 hours ago',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    href: '/grants/118'
  },
  {
    id: 3,
    type: 'compliance_flag',
    title: 'Compliance issue flagged',
    description: 'IRB approval required for Grant #121',
    time: '6 hours ago',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-600',
    href: '/grants/121'
  },
  {
    id: 4,
    type: 'reviewer_assigned',
    title: 'Reviewer assigned',
    description: 'Dr. Lisa Wang assigned to Grant #119',
    time: '8 hours ago',
    icon: UserGroupIcon,
    iconColor: 'text-purple-600',
    href: '/grants/119'
  }
]

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard-summary',
    () => api.get('/api/triage/dashboard/summary'),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight text-secondary-900">
          Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-secondary-500">
          Welcome to the Synapse Grant Triage System. Monitor grant submissions, 
          review progress, and compliance status in real-time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-secondary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-secondary-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' 
                          ? 'text-success-600' 
                          : 'text-error-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">
              Recent Activity
            </h3>
          </div>
          <div className="card-body p-0">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-secondary-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex items-start space-x-3 px-6">
                        <div className="relative">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100`}>
                            <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <Link
                                to={activity.href}
                                className="font-medium text-secondary-900 hover:text-primary-600"
                              >
                                {activity.title}
                              </Link>
                            </div>
                            <p className="mt-0.5 text-sm text-secondary-500">
                              {activity.time}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-secondary-700">
                            <p>{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card-footer">
            <Link
              to="/triage"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all activity
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <Link
                to="/upload"
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
              >
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Upload New Grant
                  </h4>
                  <p className="text-sm text-secondary-500">
                    Submit a new grant proposal for review
                  </p>
                </div>
              </Link>

              <Link
                to="/triage"
                className="flex items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors duration-200"
              >
                <ChartBarIcon className="h-8 w-8 text-success-600" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Assign Reviewers
                  </h4>
                  <p className="text-sm text-secondary-500">
                    Use AI matching to assign reviewers to grants
                  </p>
                </div>
              </Link>

              <Link
                to="/compliance"
                className="flex items-center p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors duration-200"
              >
                <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Review Compliance
                  </h4>
                  <p className="text-sm text-secondary-500">
                    Check grants for policy compliance issues
                  </p>
                </div>
              </Link>

              <Link
                to="/reviewers"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Manage Reviewers
                  </h4>
                  <p className="text-sm text-secondary-500">
                    Add or update reviewer information and expertise
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-secondary-900">
            System Status
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  API Status
                </p>
                <p className="text-sm text-success-600">Operational</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  AI Services
                </p>
                <p className="text-sm text-success-600">Operational</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  Database
                </p>
                <p className="text-sm text-success-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}