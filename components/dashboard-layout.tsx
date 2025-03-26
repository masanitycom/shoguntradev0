"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sword, Home, Coins, Gift, Users, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  // モバイルでシートを閉じる
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  // ナビゲーションアイテム
  const navItems = [
    {
      title: "ダッシュボード",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "NFT",
      href: "/dashboard/nfts",
      icon: Coins,
    },
    {
      title: "報酬",
      href: "/dashboard/rewards",
      icon: Gift,
    },
    {
      title: "天下統一への道",
      href: "/dashboard/mlm",
      icon: Users,
    },
  ]

  // サイドバー
  const Sidebar = () => (
    <div className="flex h-full flex-col gap-2 bg-black/80 backdrop-blur-sm">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <span className="font-bold text-white">SHOGUN TRADE</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start gap-2 ${pathname === item.href ? "bg-primary/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 p-4">
        <Button
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link href="/logout">ログアウト</Link>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col samurai-bg">
      {/* モバイルヘッダー */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-white/10 bg-black/70 backdrop-blur-sm px-4 sm:static lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 border-white/10 bg-black/90">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <span className="font-bold text-white">SHOGUN TRADE</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* デスクトップサイドバー */}
        <aside className="hidden w-[300px] flex-col border-r border-white/10 lg:flex">
          <Sidebar />
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

