'use client';

import React from 'react';

import type { DependencyData } from '@/types/app/ui/charts';

import GenericPieChart from '@/components/molecules/GenericPieChart/GenericPieChart';

interface DependencyRatioPieChartProps {
  data: DependencyData;
  title: string;
  className?: string;
}

export default function DependencyRatioPieChart({
  data,
  title,
  className = '',
}: DependencyRatioPieChartProps) {
  const { youngDependents, workingAge, oldDependents } = data;
  const total = youngDependents + workingAge + oldDependents;

  console.log('DependencyRatioPieChart received data:', data);
  console.log('Calculated total:', total);

  // Let GenericPieChart generate beautiful colors automatically
  const colors = {
    youngDependents: '',
    workingAge: '',
    oldDependents: '',
  };

  // Prepare chart data with semantic colors
  const chartData = [
    {
      label: 'Young (0-14)',
      value: youngDependents,
      percentage: total > 0 ? (youngDependents / total) * 100 : 0,
      color: colors.youngDependents,
    },
    {
      label: 'Working (15-64)',
      value: workingAge,
      percentage: total > 0 ? (workingAge / total) * 100 : 0,
      color: colors.workingAge,
    },
    {
      label: 'Elderly (65+)',
      value: oldDependents,
      percentage: total > 0 ? (oldDependents / total) * 100 : 0,
      color: colors.oldDependents,
    },
  ]; // Show all categories including zero values

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
