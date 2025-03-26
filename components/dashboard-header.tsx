"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sword, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sword className="h-6 w-6 text-primary" />
            <span className="font-bold">SHOGUN TRADE</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              ダッシュボード
            </Link>
            <Link
              href="/dashboard/nfts"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard/nfts" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              NFT
            </Link>
            <Link
              href="/dashboard/rewards"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard/rewards" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              報酬
            </Link>
            <Link
              href="/dashboard/mlm"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard/mlm" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              天下統一への道
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">プロフィール</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">設定</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/logout">ログアウト</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <MobileNav />
        </div>
      </div>
    </header>
  )
}

