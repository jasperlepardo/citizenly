'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function HelpContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('getting-started')

  const helpCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'residents', name: 'Resident Management', icon: '👥' },
    { id: 'households', name: 'Household Management', icon: '🏠' },
    { id: 'certificates', name: 'Certificates', icon: '📄' },
    { id: 'reports', name: 'Reports & Analytics', icon: '📊' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' }
  ]

  const helpContent = {
    'getting-started': [
      {
        question: 'How do I get started with Citizenly?',
        answer: 'Welcome to Citizenly! Start by exploring the dashboard to get an overview of your barangay data. Then navigate to the Residents section to begin managing your community records.'
      },
      {
        question: 'What is my role in the system?',
        answer: 'Your role determines what features you can access. Barangay Admins can manage all aspects of the system, while Clerks have limited access to data entry and basic operations.'
      },
      {
        question: 'How do I navigate between different sections?',
        answer: 'Use the sidebar on the left to navigate between Dashboard, Residents, Households, Business, Judiciary, Certification, and Reports sections.'
      }
    ],
    'residents': [
      {
        question: 'How do I add a new resident?',
        answer: 'Go to the Residents page and click "Add new resident". Fill out the required information including personal details, address, and household assignment.'
      },
      {
        question: 'How do I search for residents?',
        answer: 'Use the search bar in the Residents section. You can search by name, email, occupation, or other resident information.'
      },
      {
        question: 'Can I edit resident information?',
        answer: 'Yes, click on a resident\'s name or use the action menu (three dots) to edit their information. Make sure you have the necessary permissions.'
      }
    ],
    'households': [
      {
        question: 'How do I create a new household?',
        answer: 'Households are typically created automatically when you add a new resident. You can also manually create households from the Household section.'
      },
      {
        question: 'How do I assign a household head?',
        answer: 'When adding a resident, you can select their role as "Head" in the household section. Only one person can be the head of each household.'
      },
      {
        question: 'What is a household code?',
        answer: 'Each household gets a unique PSGC-compliant code that identifies it within your barangay. This code is automatically generated based on your barangay location.'
      }
    ],
    'certificates': [
      {
        question: 'What types of certificates can I issue?',
        answer: 'Currently available certificates include Barangay Certificate, Certificate of Residency, Barangay Clearance, and Certificate of Indigency.'
      },
      {
        question: 'How do I process certificate requests?',
        answer: 'Certificate requests will appear in the Certification section. You can review, approve, and generate the certificates from there.'
      },
      {
        question: 'Can residents request certificates online?',
        answer: 'This feature is being developed. Currently, certificate requests are managed through the admin interface.'
      }
    ],
    'reports': [
      {
        question: 'What reports are available?',
        answer: 'The Reports section provides demographics data, population statistics, and various analytics about your barangay residents and households.'
      },
      {
        question: 'How do I export data?',
        answer: 'Use the "Export Data" button in the Reports section to download your data in various formats for external analysis.'
      },
      {
        question: 'Can I customize report filters?',
        answer: 'Report filtering and customization features are being developed to provide more detailed analytics options.'
      }
    ],
    'troubleshooting': [
      {
        question: 'I can\'t access certain features. What should I do?',
        answer: 'Check your user role and permissions. Some features are restricted to specific roles. Contact your system administrator if you need additional access.'
      },
      {
        question: 'The system is running slowly. How can I improve performance?',
        answer: 'Try refreshing your browser, clearing your cache, or using a modern browser like Chrome or Firefox. If issues persist, contact support.'
      },
      {
        question: 'I made a mistake in data entry. Can I undo it?',
        answer: 'You can edit most records through their respective edit functions. For major changes or deletions, contact your system administrator.'
      }
    ]
  }

  return (
    <DashboardLayout 
      currentPage="help"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-montserrat font-semibold text-xl text-neutral-900 mb-0.5">Help & Support</h1>
          <p className="font-montserrat font-normal text-sm text-neutral-600">
            Find answers to common questions and get help using Citizenly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg border border-default p-4">
              <h3 className="font-montserrat font-semibold text-base text-primary mb-4">Categories</h3>
              <div className="space-y-2">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-surface-hover text-secondary'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-montserrat text-sm font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Help Content */}
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-lg border border-default p-6">
              <h2 className="font-montserrat font-semibold text-lg text-primary mb-6">
                {helpCategories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              
              <div className="space-y-6">
                {helpContent[selectedCategory as keyof typeof helpContent]?.map((item, index) => (
                  <div key={index} className="border-b border-neutral-100 pb-6 last:border-b-0 last:pb-0">
                    <h4 className="font-montserrat font-semibold text-base text-neutral-900 mb-3">
                      {item.question}
                    </h4>
                    <p className="font-montserrat text-sm text-neutral-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support Card */}
            <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-montserrat font-semibold text-base text-blue-900 mb-2">
                    Still need help?
                  </h3>
                  <p className="font-montserrat text-sm text-blue-800 mb-4">
                    If you can't find the answer you're looking for, our support team is here to help.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded font-montserrat font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <HelpContent />
    </ProtectedRoute>
  )
}