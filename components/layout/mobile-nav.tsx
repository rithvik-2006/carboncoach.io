'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, PlusCircle, Bot, ScanLine } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log', icon: PlusCircle },
  { href: '/dashboard/scan', label: 'Scan', icon: ScanLine },
  { href: '/coach', label: 'Coach', icon: Bot },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around border-t border-border bg-card px-4 py-2 md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
