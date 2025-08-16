/**
 * Contact Information Card for Resident Detail View
 *
 * @description Displays contact information including email, phone, address, etc.
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface ContactInfoCardProps {
  resident: {
    email?: string;
    mobile_number?: string;
    telephone_number?: string;
    household_code?: string;
    household?: {
      name?: string;
      house_number?: string;
      address?: string;
    };
  };
}

/**
 * Contact Information Card Component
 *
 * @description Renders contact information section for resident detail view
 * @param props - Component props containing resident contact data
 * @returns JSX element for contact information display
 *
 * @example
 * ```typescript
 * <ContactInfoCard resident={resident} />
 * ```
 */
export default function ContactInfoCard({ resident }: ContactInfoCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
        📞 Section 2: Contact Details
      </h2>
      <div className="space-y-3">
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.email || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Mobile Number</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.mobile_number || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Telephone Number</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.telephone_number || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Household Name</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.household?.name || '-'}</span>
        </div>
      </div>
    </div>
  );
}
