import React from 'react'
import { useParams } from 'react-router-dom'

export default function ReviewerDetails() {
  const { id } = useParams()
  
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-5">
        <h1 className="text-3xl font-bold text-secondary-900">Reviewer Profile</h1>
        <p className="mt-2 text-sm text-secondary-500">
          Detailed profile for reviewer #{id}
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Reviewer Profile Page
          </h3>
          <p className="text-secondary-500">
            This page would show comprehensive reviewer information, expertise, performance metrics, and review history.
          </p>
        </div>
      </div>
    </div>
  )
}