import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sword } from "lucide-react"

export default function Home() {
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <Sword className="h-12 w-12 text-emerald-400 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          SHOGUN <span className="text-emerald-400">TRADE</span>
        </h1>
        
        <p className="text-gray-300 mb-8 text-sm">
          天下統一への道 - 最高の投資体験
        </p>

        <div className="space-y-4">
          <Link href="/register" className="block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3">
              新規登録
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button 
              variant="outline" 
              className="w-full border-2 border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold py-3"
            >
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

