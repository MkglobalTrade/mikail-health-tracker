import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, HeartPulse, Pill, Brain, ArrowRight } from 'lucide-react'

const actions = [
  {
    title: 'Upload Results',
    description: 'Lab reports or sugar readings',
    href: '/upload',
    icon: Upload,
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
  },
  {
    title: 'Blood Pressure',
    description: 'Log your daily BP readings',
    href: '/blood-pressure',
    icon: HeartPulse,
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
  {
    title: 'Medications',
    description: 'Track your daily meds',
    href: '/medications',
    icon: Pill,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
  },
  {
    title: 'Ask Dr. AI',
    description: 'Get health insights instantly',
    href: '/dr-ai',
    icon: Brain,
    color: '#10b981',
    bgColor: '#d1fae5',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: action.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-sm mt-3">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
