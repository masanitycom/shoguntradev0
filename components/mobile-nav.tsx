"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>SHOGUN TRADE</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center py-2 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            ダッシュボード
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center py-2 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            プロフィール
          </Link>
          <Link
            href="/dashboard/nfts"
            className="flex items-center py-2 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            NFT
          </Link>
          <Link
            href="/dashboard/rewards"
            className="flex items-center py-2 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            報酬
          </Link>
          <Link
            href="/dashboard/mlm"
            className="flex items-center py-2 text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            MLM
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

