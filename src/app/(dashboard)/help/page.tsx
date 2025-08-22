'use client';

import React, { useState } from 'react';
import { Input } from '@/components/atoms';

export default function HelpPage() {
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
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-montserrat text-foreground mb-0.5 text-xl font-semibold">
            Help & Support
          </h1>
          <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
            Find answers to common questions and get help using Citizenly
          </p>
        </div>

        {/* Help Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-montserrat text-lg font-semibold text-gray-600 dark:text-gray-300">
              Frequently Asked Questions
            </h2>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </div>
          </div>

          {/* FAQ Search Box */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={faqSearchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFaqSearchTerm(e.target.value)}
              size={20}
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
                  className="text-gray-500 dark:text-gray-400 mx-auto mb-4 size-12"
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
                <p className="font-montserrat text-sm text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or browse by category
                </p>
              </div>
            ) : (
              Object.entries(groupedContent).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="font-montserrat flex items-center space-x-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-300">{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">({items.length})</span>
                    </h3>
                  </div>

                  {/* Category FAQ Items */}
                  <div className="space-y-3">
                    {items.map(item => {
                      const globalIndex = allFaqContent.findIndex(faq => faq === item);
                      return (
                        <div
                          key={globalIndex}
                          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <button
                            onClick={() => toggleAccordion(globalIndex)}
                            className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 w-full p-4 text-left transition-colors focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-primary-500"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-4">
                                <h4 className="font-montserrat text-foreground text-base font-semibold">
                                  {item.question}
                                </h4>
                              </div>
                              <svg
                                className={`text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 size-5 shrink-0 transition-transform ${
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
                            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                              <p className="font-montserrat text-sm leading-relaxed text-gray-600 dark:text-gray-400">
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
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="size-6 text-gray-600 dark:text-gray-400"
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
              <h3 className="font-montserrat mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                Still need help?
              </h3>
              <p className="font-montserrat mb-4 text-sm text-gray-800 dark:text-gray-200">
                If you can&apos;t find the answer you&apos;re looking for, our support team is here
                to help.
              </p>
              <button className="font-montserrat rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white dark:text-black transition-colors hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
