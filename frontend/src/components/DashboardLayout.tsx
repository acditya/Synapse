import { ReactNode } from 'react'
import nmssLogo from '/National-MS-Society-1024x1024.avif'

interface DashboardLayoutProps {
  children: ReactNode
  userType: 'applicant' | 'admin' | 'reviewer'
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const getNavItems = () => {
    switch (userType) {
      case 'applicant':
        return [
          { name: 'My Applications', href: '/applicant' },
          { name: 'Upload New', href: '/applicant/upload' },
          { name: 'Help', href: '/applicant/help' }
        ]
      case 'admin':
        return [
          { name: 'All Applications', href: '/admin' },
          { name: 'Reviewer Management', href: '/admin/reviewers' },
          { name: 'Reports', href: '/admin/reports' }
        ]
      case 'reviewer':
        return [
          { name: 'Assigned Reviews', href: '/reviewer' },
          { name: 'Completed Reviews', href: '/reviewer/completed' },
          { name: 'Profile', href: '/reviewer/profile' }
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={nmssLogo} alt="NMSS Logo" className="h-8 w-8 mr-3" />
              <span className="text-xl font-semibold text-gray-900">Synapse</span>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 1 1 15 0v10z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
