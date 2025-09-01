'use client';

import React from 'react';

import type { SexData } from '@/types/app/ui/charts';

import GenericPieChart from '../GenericPieChart/GenericPieChart';

interface SexDistributionPieChartProps {
  data: SexData;
  title?: string;
  className?: string;
}

export default function SexDistributionPieChart({
  data,
  title = 'Sex Distribution',
  className = '',
}: SexDistributionPieChartProps) {
  const { male, female } = data;
  const total = male + female;

  // Use population pyramid colors: primary-500 for male, secondary-500 for female
  const chartData = [
    {
      label: 'Male',
      value: male,
      percentage: total > 0 ? (male / total) * 100 : 0,
      color: '#3b82f6', // primary-500 (matches population pyramid)
    },
    {
      label: 'Female',
      value: female,
      percentage: total > 0 ? (female / total) * 100 : 0,
      color: '#a855f7', // secondary-500 (matches population pyramid)
    },
  ]; // Show all categories including zero values

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
