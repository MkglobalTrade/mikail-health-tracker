import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  trend?: { value: number; label: string }
  onClick?: () => void
}

export function StatsCard({ title, value, subtitle, icon, color, trend, onClick }: StatsCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded',
                  trend.value >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: color + '15' }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
