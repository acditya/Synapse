import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  DocumentTextIcon,
  EyeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Triage Board', href: '/triage', icon: DocumentTextIcon },
  { name: 'Brief View', href: '/brief', icon: EyeIcon },
  { name: 'Reviewers', href: '/reviewers', icon: UserGroupIcon },
  { name: 'Compliance', href: '/compliance', icon: ShieldCheckIcon },
  { name: 'Upload Grant', href: '/upload', icon: CloudArrowUpIcon },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <BeakerIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">Synapse</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    isActive
                      ? 'sidebar-nav-item-active'
                      : 'sidebar-nav-item-inactive',
                    'sidebar-nav-item'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-secondary-200">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <BeakerIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-secondary-900">Synapse</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  isActive
                    ? 'sidebar-nav-item-active'
                    : 'sidebar-nav-item-inactive',
                  'sidebar-nav-item'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-secondary-200">
          <div className="text-xs text-secondary-500">
            NMSS Grant Triage System
          </div>
          <div className="text-xs text-secondary-400 mt-1">
            Version 1.0.0
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-secondary-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-secondary-700 hover:bg-secondary-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-secondary-900">
            Synapse Grant Triage
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}