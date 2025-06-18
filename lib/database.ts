import { Pool } from "pg"
import { supabase } from "./supabase"

// Heroku PostgreSQLデータベース接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// データベース接続テスト
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()
    return { success: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error }
  }
}

// ユーザー関連のクエリ
export const userQueries = {
  // ユーザー登録
  createUser: async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) throw error

      return { success: true, user: data }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error }
    }
  },

  // ユーザー認証
  authenticateUser: async (identifier: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},user_id.eq.${identifier}`)
        .single()

      if (error || !data) {
        return { success: false, error: 'ユーザーが見つかりません' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error }
    }
  },

  // ユーザー情報取得
  getUserById: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return { success: true, user: data }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, error }
    }
  },
}

// NFT関連のクエリ
export const nftQueries = {
  // NFT一覧取得
  getAllNfts: async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, nfts: data || [] }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      return { success: false, error, nfts: [] }
    }
  },

  // ユーザーのNFT取得
  getUserNfts: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('nft_purchases')
        .select(`
          *,
          nfts (*)
        `)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, nfts: data || [] }
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
      return { success: false, error, nfts: [] }
    }
  },

  // NFT購入
  purchaseNft: async (userId: string, nftId: string) => {
    try {
      const { data: existingPurchase } = await supabase
        .from('nft_purchases')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existingPurchase) {
        return { success: false, error: 'ユーザーは既にNFTを所有しています' }
      }

      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single()

      if (nftError || !nft) {
        return { success: false, error: 'NFTが見つかりません' }
      }

      if (!nft.is_active) {
        return { success: false, error: 'このNFTは現在購入できません' }
      }

      const { data, error } = await supabase
        .from('nft_purchases')
        .insert({
          user_id: userId,
          nft_id: nftId,
          purchase_price: nft.price,
          delivery_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, purchase: data }
    } catch (error) {
      console.error('Error purchasing NFT:', error)
      return { success: false, error }
    }
  },

  getAllPurchases: async () => {
    try {
      const { data, error } = await supabase
        .from('nft_purchases')
        .select(`
          *,
          nfts (*),
          users (name, user_id, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, purchases: data || [] }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      return { success: false, error, purchases: [] }
    }
  },

  updateDeliveryStatus: async (purchaseId: string, status: string) => {
    try {
      const updateData: any = {
        delivery_status: status,
        updated_at: new Date().toISOString()
      }

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('nft_purchases')
        .update(updateData)
        .eq('id', purchaseId)
        .select()
        .single()

      if (error) throw error

      return { success: true, purchase: data }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      return { success: false, error }
    }
  },

  createNft: async (nftData: any) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .insert(nftData)
        .select()
        .single()

      if (error) throw error

      return { success: true, nft: data }
    } catch (error) {
      console.error('Error creating NFT:', error)
      return { success: false, error }
    }
  },

  updateNft: async (nftId: string, nftData: any) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .update({ ...nftData, updated_at: new Date().toISOString() })
        .eq('id', nftId)
        .select()
        .single()

      if (error) throw error

      return { success: true, nft: data }
    } catch (error) {
      console.error('Error updating NFT:', error)
      return { success: false, error }
    }
  },

  deleteNft: async (nftId: string) => {
    try {
      const { error } = await supabase
        .from('nfts')
        .delete()
        .eq('id', nftId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting NFT:', error)
      return { success: false, error }
    }
  },
}

// 報酬関連のクエリ
export const rewardQueries = {
  // 報酬申請
  claimReward: async (userId: string, claimType: string, feedback = "") => {
    // 実装...
    return { success: true, amount: 0, fee: 0, netAmount: 0 }
  },

  // 報酬計算（管理用）
  calculateRewards: async () => {
    // 実装...
    return { success: true, processedCount: 0 }
  },
}

// MLM関連のクエリ
export const mlmQueries = {
  // ユーザーのMLMランク取得
  getUserRank: async (userId: string) => {
    // 実装...
    return {
      success: true,
      rank: "足軽",
      stats: {
        totalInvestment: 0,
        maxLineInvestment: 0,
        otherLinesInvestment: 0,
        referralsCount: 0
      }
    }
  },

  // MLMボーナス計算（管理用）
  calculateMlmBonus: async (totalBonus: number) => {
    // 実装...
    return { success: true, ranksData: [] }
  },
}

// データベース初期化（テーブル作成）
export async function initializeDatabase() {
  // 実装...
  return { success: true }
}

export default pool
