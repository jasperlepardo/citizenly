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
    philsys_card_number?: string;
    household_code?: string;
    household?: {
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
    <div className="bg-surface border-default rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-primary mb-4 flex items-center gap-2 text-xl font-semibold">
        📞 Contact Information
      </h2>
      <div className="space-y-3">
        <div>
          <span className="text-secondary block text-sm font-medium">Email</span>
          <span className="text-primary">{resident.email || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Mobile Number</span>
          <span className="text-primary">{resident.mobile_number || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Telephone Number</span>
          <span className="text-primary">{resident.telephone_number || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">PhilSys Card Number</span>
          <span className="text-primary">{resident.philsys_card_number || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Household Code</span>
          <span className="text-primary">{resident.household_code || '-'}</span>
        </div>
        {resident.household && (
          <div>
            <span className="text-secondary block text-sm font-medium">Address</span>
            <span className="text-primary">
              {[resident.household.house_number, resident.household.address]
                .filter(Boolean)
                .join(', ') || '-'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
