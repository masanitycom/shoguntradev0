"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { BarChart3, Users, Calendar, Loader2 } from "lucide-react"

interface TaskCompletion {
  choice: string
  count: number
}

interface WeeklyTask {
  id: number
  name: string
  question: string
  choices: string[]
  reward_amount: number
  completions: number
  answerBreakdown: TaskCompletion[]
}

interface WeeklyTasksData {
  weekStart: string
  tasks: WeeklyTask[]
  totalCompletions: number
}

export default function AdminWeeklyTasksPage() {
  const [data, setData] = useState<WeeklyTasksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeeklyTasks()
  }, [])

  async function fetchWeeklyTasks() {
    try {
      const response = await fetch("/api/admin/weekly-tasks")
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "週次タスクデータの取得に失敗しました。",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">週次タスク分析</h1>
          <p className="text-zinc-400">
            今週のエアドロップタスクの完了状況と回答分析
          </p>
          {data && (
            <p className="text-sm text-zinc-500 mt-2">
              対象週: {new Date(data.weekStart).toLocaleDateString('ja-JP')} ～
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">総完了数</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{data?.totalCompletions || 0}</div>
              <p className="text-xs text-zinc-400">
                今週のタスク完了総数
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">アクティブタスク</CardTitle>
              <BarChart3 className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{data?.tasks?.length || 0}</div>
              <p className="text-xs text-zinc-400">
                現在利用可能なタスク数
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">平均完了率</CardTitle>
              <Calendar className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {data?.tasks?.length ? Math.round((data.totalCompletions / data.tasks.length) * 100) / 100 : 0}
              </div>
              <p className="text-xs text-zinc-400">
                タスクあたりの平均完了数
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {data?.tasks?.map((task) => (
            <Card key={task.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{task.name}</CardTitle>
                    <CardDescription className="text-zinc-400">{task.question}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {task.completions} 完了
                    </Badge>
                    <p className="text-sm text-zinc-400 mt-1">
                      報酬: {task.reward_amount} USDT
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium text-white">回答分析</h4>
                  <div className="space-y-3">
                    {task.answerBreakdown.map((answer, index) => {
                      const percentage = task.completions > 0 ? (answer.count / task.completions) * 100 : 0
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-300">{answer.choice}</span>
                            <span className="text-zinc-400">
                              {answer.count}回 ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2 bg-zinc-800"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!data?.tasks || data.tasks.length === 0) && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex h-40 items-center justify-center">
              <p className="text-zinc-400">今週のタスクデータがありません。</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
