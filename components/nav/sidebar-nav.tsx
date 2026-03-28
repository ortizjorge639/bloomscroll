'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Layers,
  LayoutGrid,
  List,
  Archive,
  Settings,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/feed',
    icon: Layers,
    label: 'Feed',
    description: 'TikTok-style scroll',
  },
  {
    href: '/grid',
    icon: LayoutGrid,
    label: 'Grid',
    description: 'Visual grid view',
  },
  {
    href: '/list',
    icon: List,
    label: 'List',
    description: 'Compact list view',
  },
  {
    href: '/archived',
    icon: Archive,
    label: 'Archive',
    description: 'Archived bookmarks',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Import & export',
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-16 flex-col items-center gap-1 border-r border-border bg-sidebar py-4">
      {/* Logo */}
      <Link
        href="/feed"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105"
        aria-label="BloomScroll Home"
      >
        <Sparkles className="h-5 w-5" />
      </Link>

      {/* Nav Items */}
      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
