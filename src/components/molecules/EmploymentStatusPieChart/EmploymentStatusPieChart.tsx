'use client';

import React from 'react';

import GenericPieChart from '../GenericPieChart/GenericPieChart';

interface EmploymentStatusData {
  employed: number;
  unemployed: number;
  selfEmployed: number;
  student: number;
  retired: number;
  homemaker: number;
  disabled: number;
  other: number;
}

interface EmploymentStatusPieChartProps {
  data: EmploymentStatusData;
  title?: string;
  className?: string;
}

export default function EmploymentStatusPieChart({
  data,
  title = 'Employment Status',
  className = '',
}: EmploymentStatusPieChartProps) {
  // Define employment status categories and their labels
  const employmentCategories = [
    { key: 'employed', label: 'Employed' },
    { key: 'unemployed', label: 'Unemployed' },
    { key: 'selfEmployed', label: 'Self-employed' },
    { key: 'student', label: 'Student' },
    { key: 'retired', label: 'Retired' },
    { key: 'homemaker', label: 'Homemaker' },
    { key: 'disabled', label: 'Disabled' },
    { key: 'other', label: 'Other' },
  ];

  // Calculate total and transform data
  const total = employmentCategories.reduce((sum, category) => sum + (data[category.key as keyof EmploymentStatusData] || 0), 0);
  
  const chartData = employmentCategories.map(category => ({
    label: category.label,
    value: data[category.key as keyof EmploymentStatusData] || 0,
    percentage: total > 0 ? ((data[category.key as keyof EmploymentStatusData] || 0) / total) * 100 : 0,
    color: '', // Let GenericPieChart auto-generate colors
  }));

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
