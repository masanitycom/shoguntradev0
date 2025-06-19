'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Home, 
  Users, 
  Gift, 
  ShoppingCart,
  Award,
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react'

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigation = [
    { name: '管理ダッシュボード', href: '/admin', icon: Home },
    { name: 'ユーザー管理', href: '/admin/users', icon: Users },
    { name: 'NFT管理', href: '/admin/nfts', icon: Gift },
    { name: '購入管理', href: '/admin/purchases', icon: ShoppingCart },
    { name: '報酬申請', href: '/admin/claims', icon: Award },
    { name: '紹介統計', href: '/admin/referrals', icon: BarChart3 },
    { name: '設定', href: '/admin/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 samurai-card border-r border-red-600/30">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-red-400">SHOGUN ADMIN</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="samurai-card border-r border-red-600/30">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-red-400">SHOGUN ADMIN</h1>
          </div>
          <nav className="mt-8 flex-1 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
export { AdminSidebar }
