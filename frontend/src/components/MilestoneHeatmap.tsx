import type { ARLMilestoneStatus } from '../types/arlTypes'
import { ARL_MILESTONES } from '../data/arlKnowledgePack'

interface MilestoneHeatmapProps {
  milestones: ARLMilestoneStatus[]
  onMilestoneClick: (milestone: ARLMilestoneStatus) => void
  showEvidence?: boolean
}

export default function MilestoneHeatmap({ milestones, onMilestoneClick, showEvidence = true }: MilestoneHeatmapProps) {
  const getMilestoneStatus = (level: number) => {
    const milestone = milestones.find(m => m.milestoneCode.startsWith(`ARL${level}`))
    if (!milestone) return 'not-started'
    if (milestone.met) return 'completed'
    return 'in-progress'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'not-started': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'in-progress': return '🔄'
      case 'not-started': return '⭕'
      default: return '⭕'
    }
  }

  const _getARLDescription = (level: number) => {
    const milestone = ARL_MILESTONES.find(m => m.level === level)
    return milestone?.description || ''
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#202538] mb-2">ARL Milestone Heatmap</h3>
        <p className="text-sm text-gray-600">
          Track progress across all ARL levels. Click on milestones to view evidence and details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Not Started</span>
        </div>
      </div>

      {/* Milestone Grid */}
      <div className="space-y-4">
        {ARL_MILESTONES.map((milestone) => {
          const status = getMilestoneStatus(milestone.level)
          const milestoneStatus = milestones.find(m => m.milestoneCode === milestone.code)
          
          return (
            <div
              key={milestone.code}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                status === 'completed' ? 'border-green-200 bg-green-50' :
                status === 'in-progress' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}
              onClick={() => milestoneStatus && onMilestoneClick(milestoneStatus)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    getStatusColor(status)
                  }`}>
                    {milestone.level}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#202538]">{milestone.code}</span>
                      <span className="text-lg">{getStatusIcon(status)}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1">{milestone.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {milestoneStatus && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Confidence: {Math.round(milestoneStatus.confidence * 100)}%
                      </div>
                      {milestoneStatus.evidenceDoc && (
                        <div className="text-xs text-blue-600">
                          Evidence: {milestoneStatus.evidenceDoc}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Evidence Preview */}
              {showEvidence && milestoneStatus && milestoneStatus.quoteText && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
                  <div className="text-sm text-gray-700">
                    <strong>Evidence:</strong> "{milestoneStatus.quoteText.substring(0, 100)}..."
                  </div>
                  {milestoneStatus.notes && (
                    <div className="text-xs text-gray-500 mt-1">
                      <strong>Notes:</strong> {milestoneStatus.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Action Required */}
              {status === 'in-progress' && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                  <div className="text-sm text-yellow-800">
                    <strong>Action Required:</strong> {milestone.actionTemplate}
                  </div>
                </div>
              )}

              {/* Not Started Actions */}
              {status === 'not-started' && (
                <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded">
                  <div className="text-sm text-gray-700">
                    <strong>Next Steps:</strong> {milestone.actionTemplate}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {milestones.filter(m => m.met).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {milestones.filter(m => !m.met && m.confidence > 0).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {ARL_MILESTONES.length - milestones.length}
            </div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>
      </div>
    </div>
  )
}
