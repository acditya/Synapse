import { Link, useLocation } from 'react-router-dom'

interface ReviewerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReviewerSidebar({ isOpen, onClose }: ReviewerSidebarProps) {
  const location = useLocation()

  const navItems = [
    { path: '/reviewer', label: 'Dashboard', icon: '📊' },
    { path: '/reviewer/assigned', label: 'Assigned Applications', icon: '📝' },
    { path: '/reviewer/completed', label: 'Completed Reviews', icon: '✅' },
    { path: '/reviewer/profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-[#05585F] text-white z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#05585F] font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Synapse</h1>
              <p className="text-sm text-blue-200">Reviewer Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#00A29D] text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00A29D] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">DR</span>
            </div>
            <div>
              <p className="font-medium">Dr. Sarah Johnson</p>
              <p className="text-sm text-blue-200">Neuroscience Expert</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
