import { useState } from 'react'
import ReviewerSidebar from '../components/ReviewerSidebar'

export default function ReviewerProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    institution: 'University of California, San Francisco',
    department: 'Department of Neurology',
    title: 'Professor of Neurology',
    expertise: ['Multiple Sclerosis', 'Neuroimmunology', 'Clinical Trials', 'Biomarkers'],
    bio: 'Dr. Sarah Johnson is a leading expert in multiple sclerosis research with over 15 years of experience in neuroimmunology and clinical trials. She has published over 100 peer-reviewed articles and has been involved in numerous MS research initiatives.',
    orcid: '0000-0000-0000-0000',
    phone: '+1 (555) 123-4567',
    notifications: {
      email: true,
      newAssignments: true,
      deadlineReminders: true,
      reviewUpdates: false
    }
  })

  const updateProfile = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNotification = (field: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const saveProfile = () => {
    // Here you would save to backend
    console.log('Saving profile:', profileData)
    setIsEditing(false)
  }

  const stats = [
    { label: 'Total Reviews', value: 47, color: 'text-[#05585F]' },
    { label: 'This Year', value: 12, color: 'text-blue-600' },
    { label: 'Avg. Score Given', value: '3.8/5', color: 'text-green-600' },
    { label: 'Response Time', value: '3.2 days', color: 'text-purple-600' }
  ]

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <ReviewerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-[#202538]">Profile Settings</h1>
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      className="px-4 py-2 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] transition-colors"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#202538] mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      value={profileData.institution}
                      onChange={(e) => updateProfile('institution', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => updateProfile('department', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={profileData.title}
                      onChange={(e) => updateProfile('title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Expertise Areas */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#202538] mb-6">Expertise Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#05585F] text-white rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Expertise Area</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter expertise area"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent"
                      />
                      <button className="px-4 py-3 bg-[#00A29D] text-white rounded-lg hover:bg-[#05585F] transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#202538] mb-6">Biography</h2>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05585F] focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#202538] mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(profileData.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'email' && 'Receive email notifications'}
                          {key === 'newAssignments' && 'Get notified of new review assignments'}
                          {key === 'deadlineReminders' && 'Receive deadline reminders'}
                          {key === 'reviewUpdates' && 'Get updates on review status changes'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotification(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#05585F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05585F]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Profile Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#202538] mb-4">Review Statistics</h3>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Picture */}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-24 h-24 bg-[#05585F] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">SJ</span>
                </div>
                <h3 className="font-semibold text-[#202538] mb-2">{profileData.name}</h3>
                <p className="text-sm text-gray-600">{profileData.title}</p>
                {isEditing && (
                  <button className="mt-4 text-[#05585F] hover:text-[#00A29D] text-sm font-medium">
                    Change Photo
                  </button>
                )}
              </div>

              {/* ORCID */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-[#202538] mb-4">ORCID ID</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">0000-0000-0000-0000</span>
                  <button className="text-[#05585F] hover:text-[#00A29D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
