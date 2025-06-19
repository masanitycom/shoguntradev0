export interface User {
  id: string
  email: string
  name: string
  name_kana: string
  user_id: string
  role: 'user' | 'admin'
  referrer_id?: string
  usdt_address?: string
  wallet_type?: 'TRC20' | 'ERC20' | 'BEP20'
  created_at: string
  updated_at: string
}

export interface NFT {
  id: string
  name: string
  type: 'regular' | 'special'
  price: number
  daily_return_rate: number
  image_url?: string
  description: string
  is_active: boolean
  created_at: string
}

export interface NFTPurchase {
  id: string
  user_id: string
  nft_id: string
  purchase_price: number
  purchase_date: string
  delivery_status: 'pending' | 'sent' | 'confirmed'
  delivery_date?: string
  transaction_hash?: string
}

export interface MLMLevel {
  level: number
  name: string
  name_japanese: string
  min_investment: number
  min_direct_referrals: number
  min_indirect_referrals: number
  bonus_percentage: number
}

export interface WeeklyReward {
  id: string
  user_id: string
  week_start: string
  reward_amount: number
  airdrop_tasks_completed: number
  total_tasks: number
  claimed: boolean
  claimed_at?: string
}

export interface ReferralStats {
  user_id: string
  direct_referrals: number
  indirect_referrals: number
  total_investment: number
  current_level: number
  weekly_earnings: number
}
