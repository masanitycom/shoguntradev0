"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sword, LayoutDashboard, Users, Coins, Gift, Settings, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

export function AdminSidebar() {
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
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "ユーザー管理",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "NFT管理",
      href: "/admin/nfts",
      icon: Coins,
    },
    {
      title: "報酬管理",
      href: "/admin/rewards",
      icon: Gift,
    },
    {
      title: "報酬申請一覧",
      href: "/admin/claims",
      icon: Gift,
    },
    {
      title: "システム設定",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  // サイドバー
  const Sidebar = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <span className="font-bold">SHOGUN TRADE 管理画面</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
              <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/logout">ログアウト</Link>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* モバイルヘッダー */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Sword className="h-6 w-6 text-primary" />
          <span className="font-bold">SHOGUN TRADE 管理画面</span>
        </div>
      </header>

      {/* デスクトップサイドバー */}
      <aside className="hidden w-[300px] flex-col border-r lg:flex">
        <Sidebar />
      </aside>
    </>
  )
}

