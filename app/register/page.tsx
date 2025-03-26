"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Sword } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  userId: z
    .string()
    .min(6, "ユーザーIDは6文字以上で入力してください")
    .regex(/^[a-zA-Z0-9]+$/, "半角英数字のみ使用できます"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  phoneNumber: z
    .string()
    .min(10, "電話番号を入力してください")
    .regex(/^[0-9]+$/, "ハイフンなしで入力してください"),
  referrerId: z.string().min(1, "紹介者IDを入力してください"),
  usdtAddress: z.string().optional(),
  walletType: z.enum(["evo", "other"]).optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userId: "",
      email: "",
      password: "",
      phoneNumber: "",
      referrerId: "",
      usdtAddress: "",
      walletType: "other",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "登録完了",
          description: "アカウントが正常に作成されました。ログインしてください。",
        })
        router.push("/login")
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "登録に失敗しました。もう一度お試しください。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。もう一度お試しください。",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-12 overflow-y-auto">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-6 bg-zinc-900 rounded-lg border border-zinc-800 shadow-xl">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Sword className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">新規アカウント登録</h1>
          <p className="text-sm text-zinc-400">必要事項を入力して、SHOGUN TRADEを始めましょう</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">お名前（カタカナ）</FormLabel>
                  <FormControl>
                    <Input placeholder="ヤマダ タロウ" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">ユーザーID</FormLabel>
                  <FormControl>
                    <Input placeholder="user123" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
                  </FormControl>
                  <FormDescription className="text-zinc-500">半角英数字6文字以上</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      {...field}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">パスワード</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-zinc-500">8文字以上</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">電話番号</FormLabel>
                  <FormControl>
                    <Input placeholder="09012345678" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
                  </FormControl>
                  <FormDescription className="text-zinc-500">ハイフンなし</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referrerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">紹介者ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="紹介者のユーザーID"
                      {...field}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usdtAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">USDTアドレス（BEP20）</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} className="bg-zinc-800 border-zinc-700 text-white" />
                  </FormControl>
                  <FormDescription className="text-zinc-500">任意</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-zinc-300">ウォレットタイプ</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="evo" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300">EVOカード</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300">その他</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="text-zinc-500">任意</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-6 py-6 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "登録中..." : "登録する"}
            </Button>
          </form>
        </Form>

        <p className="px-8 text-center text-sm text-zinc-400">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary text-zinc-300">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}

