'use client';

import React from 'react';
import GenericPieChart from './GenericPieChart';

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
  const { single, married, widowed, divorced, separated, annulled, registeredPartnership, liveIn } =
    data;

  const total =
    single + married + widowed + divorced + separated + annulled + registeredPartnership + liveIn;

  // Let GenericPieChart generate beautiful colors automatically
  const colors = {
    single: '',
    married: '',
    widowed: '',
    divorced: '',
    separated: '',
    annulled: '',
    registeredPartnership: '',
    liveIn: '',
  };

  // Prepare chart data with semantic colors
  const chartData = [
    {
      label: 'Single',
      value: single,
      percentage: total > 0 ? (single / total) * 100 : 0,
      color: colors.single,
    },
    {
      label: 'Married',
      value: married,
      percentage: total > 0 ? (married / total) * 100 : 0,
      color: colors.married,
    },
    {
      label: 'Widowed',
      value: widowed,
      percentage: total > 0 ? (widowed / total) * 100 : 0,
      color: colors.widowed,
    },
    {
      label: 'Divorced',
      value: divorced,
      percentage: total > 0 ? (divorced / total) * 100 : 0,
      color: colors.divorced,
    },
    {
      label: 'Separated',
      value: separated,
      percentage: total > 0 ? (separated / total) * 100 : 0,
      color: colors.separated,
    },
    {
      label: 'Annulled',
      value: annulled,
      percentage: total > 0 ? (annulled / total) * 100 : 0,
      color: colors.annulled,
    },
    {
      label: 'Registered Partnership',
      value: registeredPartnership,
      percentage: total > 0 ? (registeredPartnership / total) * 100 : 0,
      color: colors.registeredPartnership,
    },
    {
      label: 'Live-in',
      value: liveIn,
      percentage: total > 0 ? (liveIn / total) * 100 : 0,
      color: colors.liveIn,
    },
  ]; // Show all categories including zero values

  return <GenericPieChart data={chartData} title={title} className={className} />;
}
