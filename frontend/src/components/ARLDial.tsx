import type { ARLProgress } from '../types/arlTypes'

interface ARLDialProps {
  progress: ARLProgress
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
}

export default function ARLDial({ progress, size = 'medium', showDetails = true }: ARLDialProps) {
  const { currentARL, goalARL, gap, milestonesMet, milestonesTotal, completionPercentage, nextMilestones, criticalActions } = progress
  
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  }
  
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const getARLColor = (level: number) => {
    if (level <= 3) return '#EF4444' // Red for discovery
    if (level <= 6) return '#F59E0B' // Yellow for development
    return '#10B981' // Green for deployment
  }

  const getGapColor = (gap: number) => {
    if (gap <= 1) return '#10B981' // Green
    if (gap <= 3) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Dial */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getARLColor(currentARL)}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${textSizes[size]} text-[#202538]`}>
            {currentARL}
          </div>
          <div className="text-xs text-gray-500">Current ARL</div>
          {gap > 0 && (
            <div className="text-xs text-gray-500">
              Goal: {goalARL}
            </div>
          )}
        </div>
      </div>

      {/* Gap Indicator */}
      {gap > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getGapColor(gap) }}></div>
          <span className="text-sm text-gray-600">
            {gap} level{gap > 1 ? 's' : ''} to goal
          </span>
        </div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#05585F]">{milestonesMet}</div>
          <div className="text-xs text-gray-500">Milestones Met</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00A29D]">{milestonesTotal}</div>
          <div className="text-xs text-gray-500">Total Milestones</div>
        </div>
      </div>

      {/* Confidence Badge */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">High Confidence</span>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="w-full space-y-4">
          {/* Next Milestones */}
          {nextMilestones.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Milestones</h4>
              <div className="space-y-2">
                {nextMilestones.slice(0, 3).map((milestone, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-blue-800">ARL{milestone.level}:</span>
                    <span className="ml-2 text-blue-700">{milestone.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Actions */}
          {criticalActions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Critical Actions</h4>
              <div className="space-y-2">
                {criticalActions.slice(0, 3).map((action, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-red-800">{action.title}:</span>
                    <span className="ml-2 text-red-700">{action.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ARL Level Description */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current ARL Level</h4>
            <div className="text-sm text-gray-700">
              {currentARL <= 3 && (
                <p><strong>Discovery & Feasibility:</strong> Basic research and concept development phase</p>
              )}
              {currentARL >= 4 && currentARL <= 6 && (
                <p><strong>Development & Validation:</strong> Integration and testing in relevant environments</p>
              )}
              {currentARL >= 7 && (
                <p><strong>Deployment & Sustained Use:</strong> Operational integration and sustained use</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
