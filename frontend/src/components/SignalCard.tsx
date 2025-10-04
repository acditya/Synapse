import type { ExternalSignals } from '../types/arlTypes'

interface SignalCardProps {
  signals: ExternalSignals
  onAddRebuttal: (rebuttal: string) => void
  showDisclaimer?: boolean
}

export default function SignalCard({ signals, onAddRebuttal, showDisclaimer = true }: SignalCardProps) {
  const { academicProfile, newsProfile, disclaimer, rebuttalNote } = signals

  const getReputationColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReputationLabel = (score: number) => {
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#202538] mb-2">External Reputation Signals</h3>
        <p className="text-sm text-gray-600">
          Academic and public reputation profile (for reviewer selection and due diligence)
        </p>
      </div>

      {/* Academic Profile */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Academic Profile</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">H-Index</span>
              <span className="font-medium text-gray-900">{academicProfile.hIndex}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Citations</span>
              <span className="font-medium text-gray-900">{academicProfile.totalCitations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last 5 Years</span>
              <span className="font-medium text-gray-900">{academicProfile.last5yPubs} publications</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reputation Score</span>
              <span className={`font-medium ${getReputationColor(academicProfile.reputationScore)}`}>
                {Math.round(academicProfile.reputationScore * 100)}/100
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quality Rating</span>
              <span className={`font-medium ${getReputationColor(academicProfile.reputationScore)}`}>
                {getReputationLabel(academicProfile.reputationScore)}
              </span>
            </div>
          </div>
        </div>

        {/* Research Topics */}
        {academicProfile.topics.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Research Topics</div>
            <div className="flex flex-wrap gap-2">
              {academicProfile.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* News Profile */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Public Profile</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">News Mentions</span>
            <span className="font-medium text-gray-900">{newsProfile.mentions}</span>
          </div>
          
          {newsProfile.controversies.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm font-medium text-yellow-900 mb-1">Controversies</div>
              <ul className="text-sm text-yellow-800 space-y-1">
                {newsProfile.controversies.map((controversy, index) => (
                  <li key={index}>• {controversy}</li>
                ))}
              </ul>
            </div>
          )}

          {newsProfile.riskFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm font-medium text-red-900 mb-1">Risk Flags</div>
              <ul className="text-sm text-red-800 space-y-1">
                {newsProfile.riskFlags.map((flag, index) => (
                  <li key={index}>• {flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Rebuttal Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">PI Rebuttal</h4>
        {rebuttalNote ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800">{rebuttalNote}</div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">
              No rebuttal provided. PI can add context or corrections here.
            </div>
            <button
              onClick={() => {
                const rebuttal = prompt('Enter your rebuttal or clarification:')
                if (rebuttal) onAddRebuttal(rebuttal)
              }}
              className="text-sm text-[#05585F] hover:text-[#00A29D] font-medium"
            >
              + Add Rebuttal
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> {disclaimer}
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>• External signals support reviewer selection and due diligence</div>
          <div>• Not used as sole basis for scientific merit assessment</div>
          <div>• PI rebuttals are considered in final decisions</div>
          <div>• Blind review mode available to minimize bias</div>
        </div>
      </div>
    </div>
  )
}
