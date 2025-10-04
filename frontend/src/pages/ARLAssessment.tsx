import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ARLDial from '../components/ARLDial'
import MilestoneHeatmap from '../components/MilestoneHeatmap'
import FeasibilityRadar from '../components/FeasibilityRadar'
import SignalCard from '../components/SignalCard'
import ActionsPanel from '../components/ActionsPanel'
import ScholarProfileCard from '../components/ScholarProfileCard'
import EnhancedReviewerMatching from '../components/EnhancedReviewerMatching'
import STBInterview from '../components/STBInterview'
import type { 
  ARLAssessment, 
  ARLProgress, 
  BenchmarkScore, 
  ExternalSignals,
  STBAnswer 
} from '../types/arlTypes'
import { arlService } from '../services/arlService'
import { benchmarkService } from '../services/benchmarkService'

export default function ARLAssessmentPage() {
  const { applicationId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [arlAssessment, setArlAssessment] = useState<ARLAssessment | null>(null)
  const [arlProgress, setArlProgress] = useState<ARLProgress | null>(null)
  const [benchmarkScore, setBenchmarkScore] = useState<BenchmarkScore | null>(null)
  const [externalSignals, setExternalSignals] = useState<ExternalSignals | null>(null)
  const [stbAnswers, setStbAnswers] = useState<STBAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInterview, setShowInterview] = useState(false)

  useEffect(() => {
    loadAssessmentData()
  }, [applicationId])

  const loadAssessmentData = async () => {
    if (!applicationId) return
    
    setIsLoading(true)
    try {
      // Load ARL assessment
      const assessment = await arlService.loadARLAssessment(applicationId)
      if (assessment) {
        setArlAssessment(assessment)
        const progress = arlService.computeARLProgress(assessment)
        setArlProgress(progress)
      }

      // Load benchmark scores
      const benchmark = await benchmarkService.loadBenchmarkScores(applicationId)
      setBenchmarkScore(benchmark)

      // Load external signals
      const signals = await loadExternalSignals(applicationId)
      setExternalSignals(signals)

    } catch (error) {
      console.error('Error loading assessment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExternalSignals = async (applicationId: string): Promise<ExternalSignals> => {
    try {
      const response = await fetch(`/api/signals/profile/${applicationId}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading external signals:', error)
    }
    
    // Return mock data for demo
    return {
      academicProfile: {
        hIndex: 15,
        totalCitations: 1250,
        last5yPubs: 8,
        topics: ['Multiple Sclerosis', 'Neuroimaging', 'Biomarkers'],
        reputationScore: 0.75
      },
      newsProfile: {
        mentions: 12,
        controversies: [],
        riskFlags: []
      },
      disclaimer: 'External signals are for reviewer selection and due diligence only. Not used as sole basis for scientific merit assessment.',
      rebuttalNote: undefined
    }
  }

  const handleSTBComplete = async (answers: STBAnswer[]) => {
    setStbAnswers(answers)
    
    if (applicationId) {
      // Compute new ARL assessment
      const assessment = await arlService.computeARLAssessment(
        applicationId,
        answers,
        arlAssessment?.milestones || []
      )
      
      setArlAssessment(assessment)
      const progress = arlService.computeARLProgress(assessment)
      setArlProgress(progress)
      
      // Save assessment
      await arlService.saveARLAssessment(assessment)
    }
    
    setShowInterview(false)
  }

  const handleSTBSave = (answers: STBAnswer[]) => {
    setStbAnswers(answers)
    // Save draft answers
    console.log('Saving STB draft:', answers)
  }

  const handleActionComplete = (actionId: string) => {
    console.log('Completing action:', actionId)
    // Update action status
  }

  const handleActionUpdate = (actionId: string, updates: any) => {
    console.log('Updating action:', actionId, updates)
    // Update action
  }

  const handleAddRebuttal = (rebuttal: string) => {
    if (externalSignals) {
      setExternalSignals({
        ...externalSignals,
        rebuttalNote: rebuttal
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#05585F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ARL Assessment...</p>
        </div>
      </div>
    )
  }

  if (showInterview) {
    return (
      <div className="min-h-screen bg-[#F8F7F3]">
        <div className="max-w-6xl mx-auto p-6">
          <STBInterview
            onComplete={handleSTBComplete}
            onSave={handleSTBSave}
            initialAnswers={stbAnswers}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#202538]">ARL Assessment</h1>
              <p className="text-gray-600">Application Readiness Level Analysis</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowInterview(true)}
                className="px-6 py-3 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] transition-colors"
              >
                Run STB Interview
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* Boast Ribbon */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            🚀 Benchmarked using NASA ARL framework
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'milestones', label: 'Milestones', icon: '🎯' },
              { id: 'benchmarks', label: 'Benchmarks', icon: '📈' },
              { id: 'signals', label: 'Signals', icon: '🔍' },
              { id: 'scholar', label: 'Scholar Profile', icon: '👨‍🎓' },
              { id: 'reviewers', label: 'Reviewer Matching', icon: '👥' },
              { id: 'actions', label: 'Actions', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#05585F] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && arlProgress && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-[#202538] mb-6">ARL Progress</h3>
                <ARLDial progress={arlProgress} size="large" showDetails={true} />
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-[#202538] mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current ARL</span>
                    <span className="font-bold text-[#05585F]">{arlProgress.currentARL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal ARL</span>
                    <span className="font-bold text-[#00A29D]">{arlProgress.goalARL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Milestones Met</span>
                    <span className="font-bold text-gray-900">
                      {arlProgress.milestonesMet}/{arlProgress.milestonesTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-bold text-gray-900">
                      {Math.round(arlProgress.completionPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && arlAssessment && (
            <MilestoneHeatmap
              milestones={arlAssessment.milestones}
              onMilestoneClick={(milestone) => {
                console.log('Milestone clicked:', milestone)
              }}
              showEvidence={true}
            />
          )}

          {/* Benchmarks Tab */}
          {activeTab === 'benchmarks' && benchmarkScore && (
            <FeasibilityRadar
              dimensions={benchmarkScore.dimensions}
              percentile={benchmarkScore.percentile}
              notes={benchmarkScore.notes}
              recommendations={benchmarkScore.recommendations}
              showDetails={true}
            />
          )}

          {/* Signals Tab */}
          {activeTab === 'signals' && externalSignals && (
            <SignalCard
              signals={externalSignals}
              onAddRebuttal={handleAddRebuttal}
              showDisclaimer={true}
            />
          )}

          {/* Scholar Profile Tab */}
          {activeTab === 'scholar' && (
            <ScholarProfileCard 
              applicationId={applicationId || ''} 
              onProfileUpdate={(profile) => {
                console.log('Scholar profile updated:', profile)
              }}
            />
          )}

          {/* Reviewer Matching Tab */}
          {activeTab === 'reviewers' && (
            <EnhancedReviewerMatching 
              applicationId={applicationId || ''}
              onReviewerSelect={(reviewer) => {
                console.log('Reviewer selected:', reviewer)
                // Handle reviewer selection
              }}
            />
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && arlProgress && (
            <ActionsPanel
              actions={arlProgress.criticalActions}
              onActionComplete={handleActionComplete}
              onActionUpdate={handleActionUpdate}
              showCompleted={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
