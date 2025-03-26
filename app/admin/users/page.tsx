"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Download, Search, UserPlus, Pencil } from "lucide-react"

interface User {
  id: string
  name: string
  user_id: string
  email: string
  phone_number: string
  referrer_id: string
  usdt_address: string
  wallet_type: string
  mlm_rank: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "ユーザー情報の取得に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "CSVファイルを選択してください。",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", csvFile)

      const response = await fetch("/api/admin/users/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: `${data.importedCount}件のユーザーがインポートされました。`,
        })
        fetchUsers()
        setCsvFile(null)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "インポートに失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleCsvExport() {
    try {
      const response = await fetch("/api/admin/users/export")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "エクスポートに失敗しました。")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "成功",
        description: "ユーザー情報がエクスポートされました。",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "サーバーエラーが発生しました。",
      })
    }
  }

  // 検索フィルター
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ユーザー管理</h1>
        <p className="text-muted-foreground">ユーザーの管理、CSVインポート/エクスポートを行います。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CSVインポート/エクスポート</CardTitle>
            <CardDescription>ユーザー情報のCSVインポート/エクスポート</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSVファイル</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleCsvUpload} disabled={!csvFile || uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  インポート
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCsvExport}>
                <Download className="mr-2 h-4 w-4" />
                エクスポート
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ユーザー検索</CardTitle>
            <CardDescription>名前、ユーザーID、メールアドレスで検索</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-end">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                新規ユーザー
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>登録されているユーザー一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>ユーザーID</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>紹介者ID</TableHead>
                    <TableHead>ランク</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        ユーザーがいません
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.user_id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.referrer_id}</TableCell>
                        <TableCell>{user.mlm_rank}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

