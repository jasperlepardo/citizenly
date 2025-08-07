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
  const { employed, unemployed, selfEmployed, student, retired, homemaker, disabled, other } = data;

  const total =
    employed + unemployed + selfEmployed + student + retired + homemaker + disabled + other;

  // Let GenericPieChart generate beautiful colors automatically
  const colors = {
    employed: '',
    unemployed: '',
    selfEmployed: '',
    student: '',
    retired: '',
    homemaker: '',
    disabled: '',
    other: '',
  };

  // Prepare chart data with semantic colors
  const chartData = [
    {
      label: 'Employed',
      value: employed,
      percentage: total > 0 ? (employed / total) * 100 : 0,
      color: colors.employed,
    },
    {
      label: 'Unemployed',
      value: unemployed,
      percentage: total > 0 ? (unemployed / total) * 100 : 0,
      color: colors.unemployed,
    },
    {
      label: 'Self-employed',
      value: selfEmployed,
      percentage: total > 0 ? (selfEmployed / total) * 100 : 0,
      color: colors.selfEmployed,
    },
    {
      label: 'Student',
      value: student,
      percentage: total > 0 ? (student / total) * 100 : 0,
      color: colors.student,
    },
    {
      label: 'Retired',
      value: retired,
      percentage: total > 0 ? (retired / total) * 100 : 0,
      color: colors.retired,
    },
    {
      label: 'Homemaker',
      value: homemaker,
      percentage: total > 0 ? (homemaker / total) * 100 : 0,
      color: colors.homemaker,
    },
    {
      label: 'Disabled',
      value: disabled,
      percentage: total > 0 ? (disabled / total) * 100 : 0,
      color: colors.disabled,
    },
    {
      label: 'Other',
      value: other,
      percentage: total > 0 ? (other / total) * 100 : 0,
      color: colors.other,
    },
  ]; // Show all categories including zero values

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
