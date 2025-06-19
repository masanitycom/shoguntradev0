"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Gift, CheckCircle, Clock, Loader2 } from "lucide-react"

interface AirdropTask {
  id: number
  name: string
  description: string
  question: string
  choices: string[]
  reward_amount: number
  completed: boolean
  completed_at?: string
  reward_claimed: boolean
}

export default function AirdropPage() {
  const [tasks, setTasks] = useState<AirdropTask[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const response = await fetch("/api/airdrop/tasks")
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

  async function handleSubmitTask(taskId: number) {
    const selectedAnswer = selectedAnswers[taskId]
    
    if (selectedAnswer === undefined) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "回答を選択してください。",
      })
      return
    }

    setSubmitting(taskId)

    try {
      const response = await fetch("/api/airdrop/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          answers: { choice: selectedAnswer }
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "完了",
          description: "タスクが完了しました！報酬が付与されます。",
        })
        fetchTasks()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "タスクの完了に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setSubmitting(null)
    }
  }

  const today = new Date()
  const dayOfWeek = today.getDay()
  const isMonday = dayOfWeek === 1

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">エアドロップタスク</h1>
          <p className="text-zinc-400">
            簡単なアンケートに答えて報酬を獲得しましょう。毎週月曜日に報酬が配布されます。
          </p>
        </div>

        {!isMonday && (
          <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-500">
              エアドロップ報酬は毎週月曜日に配布されます。タスクは完了できますが、報酬の受取は月曜日をお待ちください。
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="flex h-40 items-center justify-center">
                  <p className="text-zinc-400">現在利用可能なタスクはありません。</p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`bg-zinc-900 border-zinc-800 ${task.completed ? "border-green-500/20 bg-green-500/5" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-white">
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Gift className="h-5 w-5 text-red-500" />
                          )}
                          {task.name}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">{task.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">
                          +{task.reward_amount} USDT
                        </div>
                        {task.completed && (
                          <div className="flex items-center gap-1 text-sm text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            完了済み
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.completed ? (
                      <div className="rounded-md border border-green-500/20 bg-green-500/10 p-4">
                        <p className="text-sm text-green-500">
                          このタスクは完了済みです。
                          {task.completed_at && (
                            <span className="ml-2">
                              完了日: {new Date(task.completed_at).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 text-white">{task.question}</h4>
                          <RadioGroup
                            value={selectedAnswers[task.id]?.toString()}
                            onValueChange={(value) => 
                              setSelectedAnswers(prev => ({ ...prev, [task.id]: parseInt(value) }))
                            }
                          >
                            {task.choices.map((choice, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`task-${task.id}-choice-${index}`} />
                                <Label htmlFor={`task-${task.id}-choice-${index}`} className="text-zinc-300">{choice}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <Button
                          onClick={() => handleSubmitTask(task.id)}
                          disabled={submitting === task.id || selectedAnswers[task.id] === undefined}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          {submitting === task.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              送信中...
                            </>
                          ) : (
                            "回答を送信"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
