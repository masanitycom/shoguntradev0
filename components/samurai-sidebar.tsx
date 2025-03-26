"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sword, Home, Coins, Gift, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function SamuraiSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b">
            <div className="flex h-14 items-center px-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Sword className="h-6 w-6 text-primary" />
                <span className="font-bold">SHOGUN TRADE</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>メニュー</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon className="mr-2" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/logout">ログアウト</Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-auto bg-[url('/images/japanese-pattern.png')] bg-repeat">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  )
}

