interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
  className?: string
}

export default function StatCard({ title, value, trend, className = "" }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return ''
    switch (trend.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600' 
      default: return 'text-neutral-500'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <div className={`bg-white box-border content-stretch flex flex-col gap-4 items-start justify-start leading-[0] overflow-clip p-4 relative rounded border border-neutral-300 shrink-0 text-left text-neutral-900 text-nowrap w-80 hover:border-neutral-400 transition-colors ${className}`}>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col font-montserrat font-semibold justify-center relative shrink-0 text-lg">
          <p className="block leading-[22px] text-nowrap whitespace-pre">
            {title}
          </p>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-montserrat ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>
      <div className="flex flex-col font-montserrat font-normal justify-center relative shrink-0 text-[72px]">
        <p className="block leading-[80px] text-nowrap whitespace-pre">
          {value}
        </p>
      </div>
    </div>
  )
}