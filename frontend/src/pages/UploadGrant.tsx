import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { grantsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function UploadGrant() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (title) {
        formData.append('title', title)
      }

      // In a real implementation, this would upload to the backend
      // const result = await grantsApi.uploadGrant(formData)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Grant uploaded successfully!')
      setTitle('')
      setUploadedFile(null)
    } catch (error) {
      toast.error('Failed to upload grant')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-secondary-200 pb-5">
        <h1 className="text-3xl font-bold text-secondary-900">Upload Grant</h1>
        <p className="mt-2 text-sm text-secondary-500">
          Submit a new grant proposal for AI-powered triage and review
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Title Input */}
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Grant Information</h3>
          </div>
          <div className="card-body">
            <div>
              <label className="form-label">
                Grant Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter grant title or leave blank for auto-extraction"
                className="form-input"
              />
              <p className="mt-1 text-sm text-secondary-500">
                If left blank, the title will be automatically extracted from the document.
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Document Upload</h3>
          </div>
          <div className="card-body">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-300 hover:border-secondary-400'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-lg font-medium text-secondary-900">
                    Processing document...
                  </p>
                  <p className="text-sm text-secondary-500">
                    Extracting metadata and running AI analysis
                  </p>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-lg font-medium text-secondary-900">
                    File uploaded successfully!
                  </p>
                  <p className="text-sm text-secondary-500">
                    {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                  </p>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="btn-secondary"
                  >
                    Upload Another File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CloudArrowUpIcon className="h-12 w-12 text-secondary-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-secondary-900">
                      {isDragActive ? 'Drop the file here' : 'Upload grant document'}
                    </p>
                    <p className="text-sm text-secondary-500">
                      Drag and drop your file here, or click to browse
                    </p>
                  </div>
                  <div className="text-xs text-secondary-400">
                    Supported formats: PDF, DOC, DOCX (max 50MB)
                  </div>
                </div>
              )}
            </div>

            {/* File Requirements */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex">
                <DocumentTextIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Document Requirements
                  </h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Complete grant proposal including abstract, aims, and methodology</li>
                      <li>Principal investigator and institutional information</li>
                      <li>Budget breakdown and project timeline</li>
                      <li>IRB approval status (if applicable)</li>
                      <li>File size must not exceed 50MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Information */}
            <div className="mt-4 bg-green-50 rounded-lg p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">
                    What happens after upload?
                  </h4>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Automatic metadata extraction (PI, budget, aims, etc.)</li>
                      <li>AI-powered eligibility assessment against NMSS criteria</li>
                      <li>Policy compliance checking using RAG system</li>
                      <li>Generation of one-page AI summary</li>
                      <li>Embedding generation for reviewer matching</li>
                      <li>Assignment to triage board for reviewer assignment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-4 bg-yellow-50 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Important Notes
                  </h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure all sensitive information is properly redacted if required</li>
                      <li>Document will be processed by AI systems for analysis</li>
                      <li>Processing may take 2-5 minutes depending on document size</li>
                      <li>You will receive email notification when processing is complete</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Recent Uploads</h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-secondary-500">
              No recent uploads to display
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}