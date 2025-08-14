/**
 * Education & Employment Card for Resident Detail View
 *
 * @description Displays education and employment information
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface EducationEmploymentCardProps {
  resident: {
    education_attainment?: string;
    is_graduate?: boolean;
    employment_status?: string;
    occupation_title?: string;
    employment_name?: string;
  };
}

/**
 * Education & Employment Card Component
 *
 * @description Renders education and employment section for resident detail view
 * @param props - Component props containing resident education/employment data
 * @returns JSX element for education and employment display
 *
 * @example
 * ```typescript
 * <EducationEmploymentCard resident={resident} />
 * ```
 */
export default function EducationEmploymentCard({ resident }: EducationEmploymentCardProps) {
  return (
    <div className="bg-surface border-default rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-primary mb-4 flex items-center gap-2 text-xl font-semibold">
        🎓 Education & Employment
      </h2>
      <div className="space-y-3">
        <div>
          <span className="text-secondary block text-sm font-medium">Education Attainment</span>
          <span className="text-primary">{resident.education_attainment || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Graduate Status</span>
          <span className="text-primary">{resident.is_graduate ? 'Graduate' : 'Non-Graduate'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Employment Status</span>
          <span className="text-primary">{resident.employment_status || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Occupation</span>
          <span className="text-primary">{resident.occupation_title || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Employment Name</span>
          <span className="text-primary">{resident.employment_name || '-'}</span>
        </div>
      </div>
    </div>
  );
}
