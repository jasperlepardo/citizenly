'use client';

import React from 'react';
import GenericPieChart from '../GenericPieChart/GenericPieChart';

interface CivilStatusData {
  single: number;
  married: number;
  widowed: number;
  divorced: number;
  separated: number;
  annulled: number;
  registeredPartnership: number;
  liveIn: number;
}

interface CivilStatusPieChartProps {
  data: CivilStatusData;
  title?: string;
  className?: string;
}

export default function CivilStatusPieChart({
  data,
  title = 'Civil Status Distribution',
  className = '',
}: CivilStatusPieChartProps) {
  // Define the civil status categories and their labels
  const civilStatusCategories = [
    { key: 'single', label: 'Single' },
    { key: 'married', label: 'Married' },
    { key: 'widowed', label: 'Widowed' },
    { key: 'divorced', label: 'Divorced' },
    { key: 'separated', label: 'Separated' },
    { key: 'annulled', label: 'Annulled' },
    { key: 'registeredPartnership', label: 'Registered Partnership' },
    { key: 'liveIn', label: 'Live-in' },
  ];

  // Calculate total and transform data
  const total = civilStatusCategories.reduce((sum, category) => sum + (data[category.key as keyof CivilStatusData] || 0), 0);
  
  const chartData = civilStatusCategories.map(category => ({
    label: category.label,
    value: data[category.key as keyof CivilStatusData] || 0,
    percentage: total > 0 ? ((data[category.key as keyof CivilStatusData] || 0) / total) * 100 : 0,
    color: '', // Let GenericPieChart auto-generate colors
  }));

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
