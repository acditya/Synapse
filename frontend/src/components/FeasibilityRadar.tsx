import type { BenchmarkDimensions } from '../types/arlTypes'

interface FeasibilityRadarProps {
  dimensions: BenchmarkDimensions
  percentile: number
  notes: string[]
  recommendations: string[]
  showDetails?: boolean
}

export default function FeasibilityRadar({ 
  dimensions, 
  percentile, 
  notes, 
  recommendations, 
  showDetails = true 
}: FeasibilityRadarProps) {
  
  const radarData = [
    {
      name: 'Feasibility',
      value: (dimensions.feasibility.methodsAdequacy + dimensions.feasibility.resources + 
              dimensions.feasibility.timelineRealism + dimensions.feasibility.sampleSize + 
              dimensions.feasibility.riskMitigation) / 5,
      color: '#EF4444'
    },
    {
      name: 'Novelty',
      value: (dimensions.novelty.topicFrontier + dimensions.novelty.msRelevance + 
              dimensions.novelty.citationQuality) / 3,
      color: '#F59E0B'
    },
    {
      name: 'Reproducibility',
      value: (dimensions.reproducibility.protocolDetail + dimensions.reproducibility.dataCodePlan + 
              dimensions.reproducibility.preregistration) / 3,
      color: '#10B981'
    },
    {
      name: 'Budget',
      value: (dimensions.budgetRealism.disallowedItems + dimensions.budgetRealism.indirectCaps + 
              dimensions.budgetRealism.unitCosts + dimensions.budgetRealism.contingency) / 4,
      color: '#3B82F6'
    },
    {
      name: 'Ethics',
      value: (dimensions.ethics.humanSubjects + dimensions.ethics.mohapCompliance + 
              dimensions.ethics.dataPrivacy + dimensions.ethics.vulnerablePopulations) / 4,
      color: '#8B5CF6'
    },
    {
      name: 'Reviewer Fit',
      value: (dimensions.reviewerFit.matchQuality + dimensions.reviewerFit.conflictCleanliness) / 2,
      color: '#EC4899'
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-[#202538]">Feasibility Benchmarking</h3>
          <div className="text-sm text-gray-600">
            Top {percentile}% percentile
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Comprehensive assessment across 6 key dimensions
        </p>
      </div>

      {/* Radar Chart */}
      <div className="mb-6">
        <div className="relative w-80 h-80 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Grid circles */}
            {[20, 40, 60, 80, 100].map((radius, index) => (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Axis lines */}
            {radarData.map((_item, index) => {
              const angle = (index * 2 * Math.PI) / radarData.length
              const x1 = 100 + 100 * Math.cos(angle - Math.PI / 2)
              const y1 = 100 + 100 * Math.sin(angle - Math.PI / 2)
              return (
                <line
                  key={index}
                  x1="100"
                  y1="100"
                  x2={x1}
                  y2={y1}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              )
            })}
            
            {/* Data points and area */}
            <polygon
              points={radarData.map((item, index) => {
                const angle = (index * 2 * Math.PI) / radarData.length
                const radius = (item.value / 100) * 100
                const x = 100 + radius * Math.cos(angle - Math.PI / 2)
                const y = 100 + radius * Math.sin(angle - Math.PI / 2)
                return `${x},${y}`
              }).join(' ')}
              fill="rgba(5, 88, 95, 0.2)"
              stroke="#05585F"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {radarData.map((_item, index) => {
              const angle = (index * 2 * Math.PI) / radarData.length
              const radius = (item.value / 100) * 100
              const x = 100 + radius * Math.cos(angle - Math.PI / 2)
              const y = 100 + radius * Math.sin(angle - Math.PI / 2)
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#05585F"
                />
              )
            })}
            
            {/* Labels */}
            {radarData.map((_item, index) => {
              const angle = (index * 2 * Math.PI) / radarData.length
              const x = 100 + 120 * Math.cos(angle - Math.PI / 2)
              const y = 100 + 120 * Math.sin(angle - Math.PI / 2)
              return (
                <text
                  key={index}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {item.name}
                </text>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {radarData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${getScoreColor(item.value)}`}>
                {Math.round(item.value)}/100
              </div>
              <div className="text-xs text-gray-500">
                {getScoreLabel(item.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes and Recommendations */}
      {showDetails && (
        <div className="space-y-4">
          {notes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Assessment Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {notes.map((note, index) => (
                  <li key={index}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-green-800 space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Overall Score */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Overall Score</div>
            <div className="text-2xl font-bold text-[#05585F]">
              {Math.round(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length)}/100
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Percentile</div>
            <div className="text-2xl font-bold text-[#00A29D]">
              {percentile}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
