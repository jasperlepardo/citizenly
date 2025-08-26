'use client';

import React from 'react';

import type { SectoralInformation } from '@/types';

interface SectoralBadgesProps {
  sectoral: SectoralInformation;
  className?: string;
}

// Field labels mapping for human-readable display
const SECTORAL_FIELD_LABELS: Record<keyof SectoralInformation, string> = {
  is_labor_force_employed: 'Labor Force Employed',
  is_unemployed: 'Unemployed',
  is_overseas_filipino_worker: 'OFW',
  is_person_with_disability: 'PWD',
  is_out_of_school_children: 'Out-of-School Children',
  is_out_of_school_youth: 'Out-of-School Youth',
  is_senior_citizen: 'Senior Citizen',
  is_registered_senior_citizen: 'Registered Senior Citizen',
  is_solo_parent: 'Solo Parent',
  is_indigenous_people: 'Indigenous People',
  is_migrant: 'Migrant',
};

export default function SectoralBadges({ sectoral, className = '' }: SectoralBadgesProps) {
  // Get all active (true) sectoral classifications
  const activeBadges = Object.entries(sectoral)
    .filter(([key, value]) => value === true)
    .map(([key]) => key as keyof SectoralInformation)
    .map(key => SECTORAL_FIELD_LABELS[key])
    .filter(label => label); // Remove any undefined labels

  if (activeBadges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
      {activeBadges.map((label) => (
        <span
          key={label}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          {label}
        </span>
      ))}
    </div>
  );
}