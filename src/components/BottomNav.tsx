'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Upload, HeartPulse, Pill, Brain, Newspaper, FileDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/upload/', label: 'Upload', icon: Upload },
  { href: '/blood-pressure/', label: 'BP', icon: HeartPulse },
  { href: '/medications/', label: 'Meds', icon: Pill },
  { href: '/dr-ai/', label: 'AI', icon: Brain },
  { href: '/news/', label: 'News', icon: Newspaper },
  { href: '/export/', label: 'Export', icon: FileDown },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname === item.href.slice(0, -1)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[44px] py-1 rounded-lg transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn('p-1.5 rounded-lg transition-all', isActive && 'bg-primary/10')}>
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
