import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

interface FormData {
  // Step 1 - Personal Info
  piName: string
  email: string
  institution: string
  department: string
  
  // Step 2 - Proposal Upload
  proposalFile: File | null
  abstract: string
  keywords: string[]
  
  // Step 3 - Budget & Compliance
  budgetItems: { category: string; amount: number }[]
  ethicsDoc: File | null
  coiDisclosure: File | null
  
  // Step 4 - Supporting Docs
  cvs: File[]
  collaborationLetters: File[]
}

interface Application {
  id: string
  title: string
  status: 'Submitted' | 'Under Review' | 'Decision Pending' | 'Awarded' | 'Rejected'
  submittedDate: string
}

export default function ApplicantPortal() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    piName: '',
    email: '',
    institution: '',
    department: '',
    proposalFile: null,
    abstract: '',
    keywords: [],
    budgetItems: [{ category: '', amount: 0 }],
    ethicsDoc: null,
    coiDisclosure: null,
    cvs: [],
    collaborationLetters: []
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [applications, setApplications] = useState<Application[]>([])

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.piName && formData.email && formData.institution && formData.department)
      case 2:
        return !!(formData.proposalFile && formData.abstract)
      case 3:
        return !!(formData.budgetItems.length > 0 && formData.ethicsDoc && formData.coiDisclosure)
      case 4:
        return formData.cvs.length > 0
      case 5:
        return true // AI Pre-Check - always valid
      case 6:
        return true // Submit - validation done in step 5
      default:
        return false
    }
  }

  const handleSubmit = () => {
    const newApplication: Application = {
      id: `APP-${Date.now()}`,
      title: formData.abstract.substring(0, 50) + '...',
      status: 'Submitted',
      submittedDate: new Date().toLocaleDateString()
    }
    
    setSubmissionId(newApplication.id)
    setApplications(prev => [newApplication, ...prev])
    setIsSubmitted(true)
  }

  const addBudgetItem = () => {
    updateFormData({
      budgetItems: [...formData.budgetItems, { category: '', amount: 0 }]
    })
  }

  const updateBudgetItem = (index: number, field: 'category' | 'amount', value: string | number) => {
    const newItems = [...formData.budgetItems]
    newItems[index] = { ...newItems[index], [field]: value }
    updateFormData({ budgetItems: newItems })
  }

  const removeBudgetItem = (index: number) => {
    const newItems = formData.budgetItems.filter((_, i) => i !== index)
    updateFormData({ budgetItems: newItems })
  }

  const getTotalBudget = () => {
    return formData.budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-gray-100 text-gray-800'
      case 'Under Review': return 'bg-blue-100 text-blue-800'
      case 'Decision Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Awarded': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isSubmitted) {
    return (
      <DashboardLayout userType="applicant">
        <div className="max-w-4xl mx-auto p-6">
          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#202538] mb-2">Application Submitted Successfully!</h1>
            <p className="text-[#202538] mb-4">Your grant application has been received and is being processed.</p>
            <div className="bg-[#F8F7F3] rounded-lg p-4 inline-block">
              <p className="text-sm text-[#202538]">Submission ID: <span className="font-mono font-bold">{submissionId}</span></p>
            </div>
          </div>

          {/* Status Dashboard */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#202538]">Your Applications</h2>
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#202538]">{app.title}</h3>
                    <p className="text-sm text-gray-600">Submitted: {app.submittedDate}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <button className="bg-[#05585F] text-white px-4 py-2 rounded-lg hover:bg-[#00A29D] transition text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="applicant">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/applicant')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-0 bg-white py-4 mb-6 z-10">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-[#00A29D] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Step 1 - Personal Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Principal Investigator Name *</label>
                <input
                  type="text"
                  value={formData.piName}
                  onChange={(e) => updateFormData({ piName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                  placeholder="jane.smith@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Institution *</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => updateFormData({ institution: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                  placeholder="University of Research"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Department *</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateFormData({ department: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                  placeholder="Department of Neuroscience"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Proposal Upload */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Proposal Upload</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Upload Proposal PDF *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00A29D] transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => updateFormData({ proposalFile: e.target.files?.[0] || null })}
                    className="hidden"
                    id="proposal-upload"
                  />
                  <label htmlFor="proposal-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PDF files only</p>
                  </label>
                </div>
                {formData.proposalFile && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.proposalFile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Abstract *</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => updateFormData({ abstract: e.target.value })}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                  placeholder="Provide a detailed abstract of your research proposal..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Budget & Compliance */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Budget & Compliance</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#202538] mb-4">Budget Items</h3>
                <div className="space-y-3">
                  {formData.budgetItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateBudgetItem(index, 'category', e.target.value)}
                        placeholder="Category (e.g., Personnel, Equipment)"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateBudgetItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount ($)"
                        className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A29D] focus:border-transparent"
                      />
                      <button
                        onClick={() => removeBudgetItem(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBudgetItem}
                    className="text-[#00A29D] hover:text-[#05585F] font-medium"
                  >
                    + Add Budget Item
                  </button>
                </div>
                <div className="mt-4 p-4 bg-[#F8F7F3] rounded-lg">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Budget:</span>
                    <span>${getTotalBudget().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#202538] mb-2">Ethics Documentation *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => updateFormData({ ethicsDoc: e.target.files?.[0] || null })}
                      className="hidden"
                      id="ethics-upload"
                    />
                    <label htmlFor="ethics-upload" className="cursor-pointer">
                      <p className="text-gray-600">Upload Ethics Doc</p>
                    </label>
                  </div>
                  {formData.ethicsDoc && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.ethicsDoc.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#202538] mb-2">COI Disclosure *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => updateFormData({ coiDisclosure: e.target.files?.[0] || null })}
                      className="hidden"
                      id="coi-upload"
                    />
                    <label htmlFor="coi-upload" className="cursor-pointer">
                      <p className="text-gray-600">Upload COI Disclosure</p>
                    </label>
                  </div>
                  {formData.coiDisclosure && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.coiDisclosure.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 - Supporting Docs */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Supporting Documents</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">CVs * (Upload multiple)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => updateFormData({ cvs: Array.from(e.target.files || []) })}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600">Upload CVs</p>
                  </label>
                </div>
                {formData.cvs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.cvs.map((file, index) => (
                      <p key={index} className="text-sm text-green-600">✓ {file.name}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#202538] mb-2">Letters of Collaboration (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => updateFormData({ collaborationLetters: Array.from(e.target.files || []) })}
                    className="hidden"
                    id="collab-upload"
                  />
                  <label htmlFor="collab-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600">Upload Collaboration Letters</p>
                  </label>
                </div>
                {formData.collaborationLetters.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.collaborationLetters.map((file, index) => (
                      <p key={index} className="text-sm text-green-600">✓ {file.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 - Review & AI Pre-Check */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Review & AI Pre-Check</h2>
            <div className="space-y-6">
              <div className="bg-[#F8F7F3] rounded-lg p-4">
                <h3 className="font-semibold text-[#202538] mb-2">Application Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>PI:</strong> {formData.piName}</p>
                  <p><strong>Institution:</strong> {formData.institution}</p>
                  <p><strong>Department:</strong> {formData.department}</p>
                  <p><strong>Total Budget:</strong> ${getTotalBudget().toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">AI Validation Flags</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>⚠️ Missing keywords extraction from abstract</li>
                  <li>⚠️ Budget justification not provided</li>
                  <li>⚠️ Timeline not specified</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Validation Passed</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ All required fields completed</li>
                  <li>✓ All required documents uploaded</li>
                  <li>✓ Budget items properly formatted</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 6 - Submit */}
        {currentStep === 6 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-[#202538] mb-6">Ready to Submit</h2>
            <p className="text-[#202538] mb-6">Review your application and submit when ready.</p>
            <button
              onClick={handleSubmit}
              className="bg-[#05585F] text-white px-6 py-3 rounded-lg hover:bg-[#00A29D] transition font-semibold"
            >
              Submit Application
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="bg-[#00A29D] text-white px-6 py-3 rounded-lg hover:bg-[#05585F] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep)}
              className="bg-[#05585F] text-white px-6 py-3 rounded-lg hover:bg-[#00A29D] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
