'use client';

import React from 'react';

// TODO: Create missing chartTransformers module
// import {
//   transformChartData,
//   getChartTitle,
// } from '@/utils/reports/chartTransformers';

// Temporary stub implementations
const getChartTitle = (type: string, title?: string) => title || `${type} Chart`;
const transformChartData = (type: string, data: any) => data;
import GenericPieChart from '@/components/molecules/GenericPieChart/GenericPieChart';
import type {
  ChartType,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
} from '@/types/app/ui/charts';


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
