"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        })
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        router.push("/login")
      }
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">ログアウト中...</div>
    </div>
  )
}
