'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { ProtectedRoute } from '@/components/organisms';
import { InputField } from '@/components/molecules';

function HelpContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);

  const allFaqContent = [
    // Getting Started
    {
      category: 'Getting Started',
      question: 'How do I get started with Citizenly?',
      answer:
        'Welcome to Citizenly! Start by exploring the dashboard to get an overview of your barangay data. Then navigate to the Residents section to begin managing your community records.',
    },
    {
      category: 'Getting Started',
      question: 'What is my role in the system?',
      answer:
        'Your role determines what features you can access. Barangay Admins can manage all aspects of the system, while Clerks have limited access to data entry and basic operations.',
    },
    {
      category: 'Getting Started',
      question: 'How do I navigate between different sections?',
      answer:
        'Use the sidebar on the left to navigate between Dashboard, Residents, Households, Business, Judiciary, Certification, and Reports sections.',
    },
    // Resident Management
    {
      category: 'Resident Management',
      question: 'How do I add a new resident?',
      answer:
        'Go to the Residents page and click "Add new resident". Fill out the required information including personal details, address, and household assignment.',
    },
    {
      category: 'Resident Management',
      question: 'How do I search for residents?',
      answer:
        'Use the search bar in the Residents section. You can search by name, email, occupation, or other resident information.',
    },
    {
      category: 'Resident Management',
      question: 'Can I edit resident information?',
      answer:
        'Yes, click on a resident&apos;s name or use the action menu (three dots) to edit their information. Make sure you have the necessary permissions.',
    },
    // Household Management
    {
      category: 'Household Management',
      question: 'How do I create a new household?',
      answer:
        'Households are typically created automatically when you add a new resident. You can also manually create households from the Household section.',
    },
    {
      category: 'Household Management',
      question: 'How do I assign a household head?',
      answer:
        'When adding a resident, you can select their role as "Head" in the household section. Only one person can be the head of each household.',
    },
    {
      category: 'Household Management',
      question: 'What is a household code?',
      answer:
        'Each household gets a unique PSGC-compliant code that identifies it within your barangay. This code is automatically generated based on your barangay location.',
    },
    // Certificates
    {
      category: 'Certificates',
      question: 'What types of certificates can I issue?',
      answer:
        'Currently available certificates include Barangay Certificate, Certificate of Residency, Barangay Clearance, and Certificate of Indigency.',
    },
    {
      category: 'Certificates',
      question: 'How do I process certificate requests?',
      answer:
        'Certificate requests will appear in the Certification section. You can review, approve, and generate the certificates from there.',
    },
    {
      category: 'Certificates',
      question: 'Can residents request certificates online?',
      answer:
        'This feature is being developed. Currently, certificate requests are managed through the admin interface.',
    },
    // Reports & Analytics
    {
      category: 'Reports & Analytics',
      question: 'What reports are available?',
      answer:
        'The Reports section provides demographics data, population statistics, and various analytics about your barangay residents and households.',
    },
    {
      category: 'Reports & Analytics',
      question: 'How do I export data?',
      answer:
        'Use the "Export Data" button in the Reports section to download your data in various formats for external analysis.',
    },
    {
      category: 'Reports & Analytics',
      question: 'Can I customize report filters?',
      answer:
        'Report filtering and customization features are being developed to provide more detailed analytics options.',
    },
    // Troubleshooting
    {
      category: 'Troubleshooting',
      question: 'I can&apos;t access certain features. What should I do?',
      answer:
        'Check your user role and permissions. Some features are restricted to specific roles. Contact your system administrator if you need additional access.',
    },
    {
      category: 'Troubleshooting',
      question: 'The system is running slowly. How can I improve performance?',
      answer:
        'Try refreshing your browser, clearing your cache, or using a modern browser like Chrome or Firefox. If issues persist, contact support.',
    },
    {
      category: 'Troubleshooting',
      question: 'I made a mistake in data entry. Can I undo it?',
      answer:
        'You can edit most records through their respective edit functions. For major changes or deletions, contact your system administrator.',
    },
  ];

  // Helper functions for accordion
  const toggleAccordion = (index: number) => {
    setOpenAccordions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const isAccordionOpen = (index: number) => openAccordions.includes(index);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Getting Started': '🚀',
      'Resident Management': '👥',
      'Household Management': '🏠',
      Certificates: '📄',
      'Reports & Analytics': '📊',
      Troubleshooting: '🔧',
    };
    return icons[category] || '📋';
  };

  // Group content by category
  const getGroupedContent = () => {
    const groups: { [key: string]: typeof allFaqContent } = {};

    allFaqContent.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return groups;
  };

  // Filter help content based on search
  const getFilteredGroupedContent = () => {
    const grouped = getGroupedContent();

    if (!faqSearchTerm.trim()) return grouped;

    const searchLower = faqSearchTerm.toLowerCase();
    const filteredGroups: { [key: string]: typeof allFaqContent } = {};

    Object.entries(grouped).forEach(([category, items]) => {
      const filteredItems = items.filter(
        item =>
          item.question.toLowerCase().includes(searchLower) ||
          item.answer.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower)
      );

      if (filteredItems.length > 0) {
        filteredGroups[category] = filteredItems;
      }
    });

    return filteredGroups;
  };

  const groupedContent = getFilteredGroupedContent();
  const totalResults = Object.values(groupedContent).flat().length;

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-montserrat text-foreground mb-0.5 text-xl font-semibold">
            Help & Support
          </h1>
          <p className="font-montserrat text-secondary text-sm font-normal">
            Find answers to common questions and get help using Citizenly
          </p>
        </div>

        {/* Help Content */}
        <div className="bg-surface border-default rounded-lg border p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-montserrat text-primary text-lg font-semibold">
              Frequently Asked Questions
            </h2>
            <div className="text-muted text-sm">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </div>
          </div>

          {/* FAQ Search Box */}
          <div className="mb-6">
            <InputField
              type="text"
              placeholder="Search FAQs..."
              value={faqSearchTerm}
              onChange={e => setFaqSearchTerm(e.target.value)}
              size="lg"
              clearable
              onClear={() => setFaqSearchTerm('')}
              leftIcon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* FAQ Sections by Category */}
          <div className="space-y-8">
            {Object.keys(groupedContent).length === 0 ? (
              <div className="py-8 text-center">
                <svg
                  className="text-muted mx-auto mb-4 size-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.91.616-5.471 1.661M12 3a9 9 0 11-7.99 14.045l1.45 1.45A7.966 7.966 0 0012 21a7.966 7.966 0 006.54-3.505l1.45-1.45A9 9 0 0012 3z"
                  />
                </svg>
                <h3 className="font-montserrat text-foreground mb-2 font-medium">
                  No results found
                </h3>
                <p className="font-montserrat text-secondary text-sm">
                  Try adjusting your search terms or browse by category
                </p>
              </div>
            ) : (
              Object.entries(groupedContent).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="border-default border-b pb-2">
                    <h3 className="font-montserrat text-primary flex items-center space-x-2 text-lg font-semibold">
                      <span className="text-primary-600">{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                      <span className="text-muted text-sm font-normal">({items.length})</span>
                    </h3>
                  </div>

                  {/* Category FAQ Items */}
                  <div className="space-y-3">
                    {items.map(item => {
                      const globalIndex = allFaqContent.findIndex(faq => faq === item);
                      return (
                        <div
                          key={globalIndex}
                          className="border-default overflow-hidden rounded-lg border"
                        >
                          <button
                            onClick={() => toggleAccordion(globalIndex)}
                            className="bg-background-muted hover:bg-surface-hover focus:ring-primary-500 w-full p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-4">
                                <h4 className="font-montserrat text-foreground text-base font-semibold">
                                  {item.question}
                                </h4>
                              </div>
                              <svg
                                className={`text-muted size-5 shrink-0 transition-transform ${
                                  isAccordionOpen(globalIndex) ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>
                          {isAccordionOpen(globalIndex) && (
                            <div className="bg-surface border-default border-t p-4">
                              <p className="font-montserrat text-secondary text-sm leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="border-primary-200 bg-primary-50 mt-6 rounded-lg border p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 flex size-12 shrink-0 items-center justify-center rounded-full">
              <svg
                className="text-primary-600 size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-montserrat text-primary-900 mb-2 text-base font-semibold">
                Still need help?
              </h3>
              <p className="font-montserrat text-primary-800 mb-4 text-sm">
                If you can&apos;t find the answer you&apos;re looking for, our support team is here
                to help.
              </p>
              <button className="font-montserrat bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <HelpContent />
    </ProtectedRoute>
  );
}
