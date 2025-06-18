"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Coins, Users, Gift, Settings, Menu, Share2 } from "lucide-react"
import { ShogunIcon } from "@/components/ui/shogun-icon"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const navItems = [
    {
      title: "ダッシュボード",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "NFT管理",
      href: "/dashboard/nfts",
      icon: Coins,
    },
    {
      title: "MLM統計",
      href: "/dashboard/mlm",
      icon: Users,
    },
    {
      title: "紹介管理",
      href: "/dashboard/referrals",
      icon: Share2,
    },
    {
      title: "報酬管理",
      href: "/dashboard/rewards",
      icon: Gift,
    },
    {
      title: "設定",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShogunIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-white">SHOGUN TRADE</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-14 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-black border-white/10">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <ShogunIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-white">SHOGUN TRADE</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <div className={`pb-12 w-64 bg-black border-r border-white/10 ${className}`}>
      <Sidebar />
    </div>
  )
}
