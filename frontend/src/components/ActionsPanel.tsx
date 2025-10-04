import type { ARLAction } from '../types/arlTypes'

interface ActionsPanelProps {
  actions: ARLAction[]
  onActionComplete: (actionId: string) => void
  onActionUpdate: (actionId: string, updates: Partial<ARLAction>) => void
  showCompleted?: boolean
}

export default function ActionsPanel({ 
  actions, 
  onActionComplete, 
  onActionUpdate, 
  showCompleted = false 
}: ActionsPanelProps) {
  
  const filteredActions = showCompleted 
    ? actions 
    : actions.filter(action => action.priority !== 'low')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800'
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'low': return 'bg-green-100 border-green-200 text-green-800'
      default: return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'upload': return '📁'
      case 'clarify': return '❓'
      case 'provide': return '📝'
      case 'complete': return '✅'
      default: return '📋'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const sortedActions = filteredActions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
  })

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-[#202538]">Action Items</h3>
          <div className="text-sm text-gray-600">
            {filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Prioritized actions to improve ARL assessment
        </p>
      </div>

      {/* Priority Legend */}
      <div className="flex items-center space-x-4 mb-6 text-sm">
        <div className="flex items-center space-x-1">
          <span>🔴</span>
          <span>High Priority</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🟡</span>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🟢</span>
          <span>Low Priority</span>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {sortedActions.map((action) => (
          <div
            key={action.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              getPriorityColor(action.priority)
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getActionIcon(action.actionType)}</span>
                  <span className="text-lg">{getPriorityIcon(action.priority)}</span>
                  <h4 className="font-semibold text-gray-900">{action.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getPriorityColor(action.priority)
                  }`}>
                    {action.priority.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                
                {action.suggestedDocuments.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-600 mb-1">Suggested Documents:</div>
                    <div className="flex flex-wrap gap-2">
                      {action.suggestedDocuments.map((doc, docIndex) => (
                        <span
                          key={docIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {action.deadline && (
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Deadline:</strong> {action.deadline.toLocaleDateString()}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <strong>Milestone:</strong> {action.milestoneCode} | 
                  <strong> Type:</strong> {action.actionType}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onActionComplete(action.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Complete
                </button>
                
                <button
                  onClick={() => {
                    const updates = prompt('Enter updates or notes:')
                    if (updates) onActionUpdate(action.id, { description: updates })
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">
              {actions.filter(a => a.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {actions.filter(a => a.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {actions.filter(a => a.priority === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {actions.length}
            </div>
            <div className="text-sm text-gray-600">Total Actions</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => {
            const newAction = prompt('Add new action item:')
            if (newAction) {
              // This would typically call an API to add the action
              console.log('Adding new action:', newAction)
            }
          }}
          className="px-4 py-2 bg-[#05585F] text-white text-sm rounded-lg hover:bg-[#00A29D] transition-colors"
        >
          + Add Action
        </button>
        
        <button
          onClick={() => {
            // This would typically call an API to mark all low priority actions as completed
            console.log('Completing all low priority actions')
          }}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          Complete Low Priority
        </button>
      </div>
    </div>
  )
}
