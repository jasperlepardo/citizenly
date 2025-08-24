/**
 * Chart Types
 * Consolidated type definitions for all chart components
 */

// Re-export chart data types from UI lib
export type {
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  ChartType,
  ChartDataPoint
} from '@/lib/ui/chart-transformers';

// Re-export pie chart types
export type {
  PieSliceData,
  PieSliceWithAngles
} from '@/lib/ui/pieChartMath';

// Re-export population pyramid types
export type {
  AgeGroupData,
  PopulationStats,
  TooltipData
} from '@/lib/ui/population-pyramid';

// Common chart component props
export interface BaseChartProps {
  /** Chart title */
  title?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Chart size variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Chart intent/purpose */
  intent?: 'primary' | 'secondary' | 'embedded';
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string;
}

// Pie chart specific props
export interface PieChartProps extends BaseChartProps {
  /** Chart data points */
  data: PieSliceData[];
  
  /** Show legend */
  showLegend?: boolean;
  
  /** Show values on slices */
  showValues?: boolean;
  
  /** Show percentages on slices */
  showPercentages?: boolean;
  
  /** Chart radius */
  radius?: number;
  
  /** Inner radius for donut charts */
  innerRadius?: number;
}

// Bar chart props
export interface BarChartProps extends BaseChartProps {
  /** Chart data points */
  data: ChartDataPoint[];
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Show grid lines */
  showGrid?: boolean;
  
  /** Show axis labels */
  showAxisLabels?: boolean;
}

// Population pyramid specific props
export interface PopulationPyramidProps extends BaseChartProps {
  /** Age group data */
  data: AgeGroupData[];
  
  /** Show statistics */
  showStats?: boolean;
  
  /** Show age labels */
  showAgeLabels?: boolean;
  
  /** Color scheme */
  colorScheme?: 'default' | 'blue-purple' | 'custom';
}