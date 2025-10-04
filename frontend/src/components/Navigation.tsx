import { useState } from 'react'

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const views = [
    { id: 'landing', name: 'Home', icon: '🏠' },
    { id: 'applicant', name: 'Applicant', icon: '👤' },
    { id: 'admin', name: 'Admin', icon: '⚙️' },
    { id: 'reviewer', name: 'Reviewer', icon: '📝' }
  ]

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white shadow-lg rounded-lg p-3 hover:shadow-xl transition-shadow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => {
                onViewChange(view.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 ${
                currentView === view.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{view.icon}</span>
              <span className="font-medium">{view.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
