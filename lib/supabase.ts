import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          user_id: string
          email: string
          password: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          email: string
          password: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          email?: string
          password?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      nfts: {
        Row: {
          id: string
          name: string
          price: number
          daily_rate: number
          is_special: boolean
          is_active: boolean
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          daily_rate: number
          is_special?: boolean
          is_active?: boolean
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          daily_rate?: number
          is_special?: boolean
          is_active?: boolean
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      nft_purchases: {
        Row: {
          id: string
          user_id: string
          nft_id: string
          purchase_price: number
          delivery_status: string
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nft_id: string
          purchase_price: number
          delivery_status?: string
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nft_id?: string
          purchase_price?: number
          delivery_status?: string
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
