import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Coins, Users, Gift, Settings } from 'lucide-react'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'ホーム'
    },
    {
      href: '/dashboard/nfts',
      icon: Coins,
      label: 'NFT'
    },
    {
      href: '/dashboard/referrals',
      icon: Users,
      label: '紹介'
    },
    {
      href: '/dashboard/rewards',
      icon: Gift,
      label: '報酬'
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: '設定'
    }
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 lg:hidden ${className}`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-red-600 bg-red-600/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
