"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReferralLink } from "@/components/referral/referral-link"
import { ReferralTree } from "@/components/referral/referral-tree"

export default function ReferralsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">紹介管理</h1>
          <p className="text-white/70">紹介リンクの管理と紹介ネットワークの確認ができます。</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ReferralLink />
          <ReferralTree />
        </div>
      </div>
    </DashboardLayout>
  )
}
