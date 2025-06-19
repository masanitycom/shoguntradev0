"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Plus, Loader2 } from "lucide-react"

interface AirdropTask {
  id: number
  name: string
  description: string
  question: string
  choices: string[]
  reward_amount: number
  is_active: boolean
  created_at: string
}

export default function AdminAirdropPage() {
  const [tasks, setTasks] = useState<AirdropTask[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    question: "",
    choices: ["", "", "", "その他"],
    reward_amount: ""
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const response = await fetch("/api/admin/airdrop/tasks")
      const data = await response.json()

      if (data.success) {
        setTasks(data.tasks)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "タスクの取得に失敗しました。",
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

  async function handleCreateTask() {
    if (!formData.name || !formData.description || !formData.question || !formData.reward_amount) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "すべての必須項目を入力してください。",
      })
      return
    }

    if (formData.choices.slice(0, 3).some(choice => !choice.trim())) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "最初の3つの選択肢を入力してください。",
      })
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/admin/airdrop/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          question: formData.question,
          choices: formData.choices,
          reward_amount: parseFloat(formData.reward_amount)
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "タスクが作成されました。",
        })
        setFormData({
          name: "",
          description: "",
          question: "",
          choices: ["", "", "", "その他"],
          reward_amount: ""
        })
        setShowCreateForm(false)
        fetchTasks()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "タスクの作成に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-red-500">エアドロップタスク管理</h1>
            <p className="text-zinc-400">4択アンケートタスクを作成・管理します。</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            新しいタスクを作成
          </Button>
        </div>

        {showCreateForm && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">新しいタスクを作成</CardTitle>
              <CardDescription className="text-zinc-400">4択アンケートタスクの詳細を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">タスク名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="戦国武将アンケート"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward" className="text-white">報酬額 (USDT)</Label>
                  <Input
                    id="reward"
                    type="number"
                    step="0.01"
                    value={formData.reward_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: e.target.value }))}
                    placeholder="10.00"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="あなたの好きな戦国武将についてお答えください"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question" className="text-white">質問</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="あなたの好きな戦国武将は？"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">選択肢（4つ目は自動的に「その他」になります）</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.choices.map((choice, index) => (
                    <Input
                      key={index}
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...formData.choices]
                        newChoices[index] = e.target.value
                        setFormData(prev => ({ ...prev, choices: newChoices }))
                      }}
                      placeholder={index === 3 ? "その他（固定）" : `選択肢 ${index + 1}`}
                      disabled={index === 3}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="border-zinc-700 text-white hover:bg-zinc-800">
                  キャンセル
                </Button>
                <Button onClick={handleCreateTask} disabled={creating} className="bg-red-600 hover:bg-red-700">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    "タスクを作成"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">既存のタスク</CardTitle>
            <CardDescription className="text-zinc-400">作成済みのエアドロップタスク一覧</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-300">タスク名</TableHead>
                    <TableHead className="text-zinc-300">質問</TableHead>
                    <TableHead className="text-zinc-300">報酬額</TableHead>
                    <TableHead className="text-zinc-300">ステータス</TableHead>
                    <TableHead className="text-zinc-300">作成日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow className="border-zinc-800">
                      <TableCell colSpan={5} className="text-center text-zinc-400">
                        タスクがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id} className="border-zinc-800">
                        <TableCell className="font-medium text-white">{task.name}</TableCell>
                        <TableCell className="text-zinc-300">{task.question}</TableCell>
                        <TableCell className="text-zinc-300">{task.reward_amount} USDT</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.is_active ? 'アクティブ' : '無効'}
                          </span>
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {new Date(task.created_at).toLocaleDateString('ja-JP')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
