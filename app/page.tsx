import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sword } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SHOGUN TRADE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button>新規登録</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  SHOGUN TRADE
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  NFT投資とMLMを組み合わせた革新的なプラットフォーム。
                  日利0.5%～2.0%の報酬を獲得し、天下統一への道を進みましょう。
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    今すぐ始める
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    ログイン
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-xl font-bold">NFT投資</h3>
                  <p className="text-muted-foreground">
                    300 USDTから100,000 USDTまでの様々な価格帯のNFTに投資し、 日利0.5%～2.0%の報酬を獲得できます。
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-xl font-bold">MLMシステム</h3>
                  <p className="text-muted-foreground">
                    「天下統一への道」で8段階のランクを上げながら、 より多くの報酬を獲得しましょう。
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-xl font-bold">週次報酬</h3>
                  <p className="text-muted-foreground">
                    週ごとに報酬を受け取るか、複利運用するかを選択できます。 最大で投資額の300%まで報酬を獲得できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SHOGUN TRADE. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              利用規約
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              プライバシーポリシー
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

