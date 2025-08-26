'use client';

import React from 'react';

import {
  transformChartData,
  getChartTitle,
  type ChartType,
  type DependencyData,
  type SexData,
  type CivilStatusData,
  type EmploymentStatusData,
} from '@/lib/charts';

import GenericPieChart from '../GenericPieChart/GenericPieChart';

interface BaseStatisticsChartProps {
  title?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  intent?: 'primary' | 'secondary' | 'embedded';
}

type StatisticsChartProps =
  | ({ type: 'dependency'; data: DependencyData } & BaseStatisticsChartProps)
  | ({ type: 'sex'; data: SexData } & BaseStatisticsChartProps)
  | ({ type: 'civilStatus'; data: CivilStatusData } & BaseStatisticsChartProps)
  | ({ type: 'employment'; data: EmploymentStatusData } & BaseStatisticsChartProps);

export default function StatisticsChart(props: StatisticsChartProps) {
  const { type, data, title, className = '', variant = 'default', intent } = props;

  const chartTitle = getChartTitle(type, title);
  const chartData = transformChartData(type, data);

  // Build semantic utility classes based on variant and intent
  const getVariantClasses = () => {
    const baseClasses = 'w-full';

    switch (variant) {
      case 'compact':
        return `${baseClasses} max-w-3`;
      case 'detailed':
        return `${baseClasses} p-6 border border-zinc-100 dark:border-zinc-700 rounded-lg`;
      default:
        return baseClasses;
    }
  };

  const getIntentClasses = () => {
    switch (intent) {
      case 'primary':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'secondary':
        return 'bg-pink-50 dark:bg-pink-900/20';
      case 'embedded':
        return 'bg-transparent';
      default:
        return '';
    }
  };

  const semanticClasses = [getVariantClasses(), getIntentClasses(), className]
    .filter(Boolean)
    .join(' ');

  return <GenericPieChart data={chartData} title={chartTitle} className={semanticClasses} />;
}
