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
    <div className="bg-surface rounded-xl shadow-sm border border-default p-6 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        📞 Contact Information
      </h2>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-secondary block">Email</span>
          <span className="text-primary">{resident.email || '-'}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-secondary block">Mobile Number</span>
          <span className="text-primary">{resident.mobile_number || '-'}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-secondary block">Telephone Number</span>
          <span className="text-primary">{resident.telephone_number || '-'}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-secondary block">PhilSys Card Number</span>
          <span className="text-primary">{resident.philsys_card_number || '-'}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-secondary block">Household Code</span>
          <span className="text-primary">{resident.household_code || '-'}</span>
        </div>
        {resident.household && (
          <div>
            <span className="text-sm font-medium text-secondary block">Address</span>
            <span className="text-primary">
              {[
                resident.household.house_number,
                resident.household.address
              ].filter(Boolean).join(', ') || '-'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}