import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    // Return error with more context
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred'
    return Promise.reject(new Error(errorMessage))
  }
)

// API endpoints
export const grantsApi = {
  // Get all grants
  getGrants: (params?: any) => api.get('/grants', { params }),
  
  // Get grant by ID
  getGrant: (id: number) => api.get(`/grants/${id}`),
  
  // Upload grant document
  uploadGrant: (formData: FormData) => 
    api.post('/grants/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Update grant
  updateGrant: (id: number, data: any) => api.put(`/grants/${id}`, data),
  
  // Delete grant
  deleteGrant: (id: number) => api.delete(`/grants/${id}`),
  
  // Regenerate summary
  regenerateSummary: (id: number) => api.post(`/grants/${id}/regenerate-summary`),
}

export const reviewersApi = {
  // Get all reviewers
  getReviewers: (params?: any) => api.get('/reviewers', { params }),
  
  // Get reviewer by ID
  getReviewer: (id: number) => api.get(`/reviewers/${id}`),
  
  // Create reviewer
  createReviewer: (data: any) => api.post('/reviewers', data),
  
  // Update reviewer
  updateReviewer: (id: number, data: any) => api.put(`/reviewers/${id}`, data),
  
  // Delete reviewer
  deleteReviewer: (id: number) => api.delete(`/reviewers/${id}`),
  
  // Refresh reviewer data
  refreshReviewerData: (id: number) => api.post(`/reviewers/${id}/refresh-data`),
  
  // Check conflict of interest
  checkCOI: (reviewerId: number, grantId: number) => 
    api.post(`/reviewers/${reviewerId}/check-coi/${grantId}`),
  
  // Get reviewer workload
  getWorkload: (id: number) => api.get(`/reviewers/${id}/workload`),
}

export const triageApi = {
  // Get triage records
  getTriageRecords: (params?: any) => api.get('/triage', { params }),
  
  // Get triage record by ID
  getTriageRecord: (id: number) => api.get(`/triage/${id}`),
  
  // Assign reviewer
  assignReviewer: (data: any) => api.post('/triage/assign', data),
  
  // Update triage record
  updateTriageRecord: (id: number, data: any) => api.put(`/triage/${id}`, data),
  
  // Delete triage record
  deleteTriageRecord: (id: number) => api.delete(`/triage/${id}`),
  
  // Batch assign reviewers
  batchAssign: (grantIds: number[]) => api.post('/triage/batch-assign', { grant_ids: grantIds }),
  
  // Get dashboard summary
  getDashboardSummary: () => api.get('/triage/dashboard/summary'),
}

export const complianceApi = {
  // Run compliance check
  runComplianceCheck: (grantId: number, checkTypes?: string[]) => 
    api.post(`/compliance/check/${grantId}`, { check_types: checkTypes }),
  
  // Get compliance checks for grant
  getGrantCompliance: (grantId: number, params?: any) => 
    api.get(`/compliance/grant/${grantId}`, { params }),
  
  // Get compliance check by ID
  getComplianceCheck: (id: number) => api.get(`/compliance/${id}`),
  
  // Update compliance check
  updateComplianceCheck: (id: number, data: any) => api.put(`/compliance/${id}`, data),
  
  // Get all compliance checks
  getAllCompliance: (params?: any) => api.get('/compliance', { params }),
  
  // Get compliance dashboard summary
  getComplianceSummary: () => api.get('/compliance/dashboard/summary'),
  
  // Batch compliance check
  batchComplianceCheck: (grantIds: number[], checkTypes?: string[]) => 
    api.post('/compliance/batch-check', { grant_ids: grantIds, check_types: checkTypes }),
}

export default api