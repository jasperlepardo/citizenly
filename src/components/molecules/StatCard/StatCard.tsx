interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  className?: string;
}

export default function StatCard({ title, value, trend, className = '' }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-neutral-500';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div
      className={`relative box-border flex w-80 shrink-0 flex-col content-stretch items-start justify-start gap-4 text-clip text-nowrap rounded border border-neutral-300 bg-white p-4 text-left leading-5 text-neutral-900 transition-colors hover:border-neutral-400 ${className}`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="font-montserrat relative flex shrink-0 flex-col justify-center text-lg font-semibold">
          <p className="block whitespace-pre text-nowrap leading-[22px]">{title}</p>
        </div>
        {trend && (
          <div className={`font-montserrat flex items-center gap-1 text-sm ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>
      <div className="font-montserrat relative flex shrink-0 flex-col justify-center text-[72px] font-normal">
        <p className="block whitespace-pre text-nowrap leading-[80px]">{value}</p>
      </div>
    </div>
  );
}
