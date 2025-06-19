import { supabase } from './supabase'

export interface ReferralStats {
  directReferrals: number
  totalReferrals: number
  directVolume: number
  totalVolume: number
  currentLevel: string
  nextLevel?: string
  progressToNext: number
}

export async function generateReferralCode(userId: string): Promise<string> {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${randomStr}`.toUpperCase()
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const { data: directReferrals, error: directError } = await supabase
    .from('profiles')
    .select('id, total_investment')
    .eq('referred_by', userId)

  if (directError) {
    throw new Error('Failed to fetch direct referrals')
  }

  const directCount = directReferrals?.length || 0
  const directVolume = directReferrals?.reduce((sum, ref) => sum + (ref.total_investment || 0), 0) || 0

  const { data: allReferrals, error: allError } = await supabase
    .rpc('get_all_referrals', { user_id: userId })

  const totalCount = allReferrals?.length || directCount
  const totalVolume = allReferrals?.reduce((sum: number, ref: any) => sum + (ref.total_investment || 0), 0) || directVolume

  const currentLevel = calculateLevel(directCount, totalVolume)
  const nextLevel = getNextLevel(currentLevel)
  const progressToNext = calculateProgress(directCount, totalVolume, nextLevel)

  return {
    directReferrals: directCount,
    totalReferrals: totalCount,
    directVolume,
    totalVolume,
    currentLevel,
    nextLevel,
    progressToNext
  }
}

export function calculateLevel(directReferrals: number, totalVolume: number): string {
  if (totalVolume >= 300000 && directReferrals >= 50) return '将軍'
  if (totalVolume >= 150000 && directReferrals >= 30) return '大将'
  if (totalVolume >= 75000 && directReferrals >= 20) return '大名'
  if (totalVolume >= 35000 && directReferrals >= 12) return '旗本'
  if (totalVolume >= 15000 && directReferrals >= 8) return '騎馬武者'
  if (totalVolume >= 5000 && directReferrals >= 5) return '武士'
  if (totalVolume >= 1000 && directReferrals >= 3) return '侍'
  return '足軽'
}

export function getNextLevel(currentLevel: string): string | undefined {
  const levels = ['足軽', '侍', '武士', '騎馬武者', '旗本', '大名', '大将', '将軍']
  const currentIndex = levels.indexOf(currentLevel)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined
}

export function calculateProgress(directReferrals: number, totalVolume: number, nextLevel?: string): number {
  if (!nextLevel) return 100

  const requirements = {
    '侍': { referrals: 3, volume: 1000 },
    '武士': { referrals: 5, volume: 5000 },
    '騎馬武者': { referrals: 8, volume: 15000 },
    '旗本': { referrals: 12, volume: 35000 },
    '大名': { referrals: 20, volume: 75000 },
    '大将': { referrals: 30, volume: 150000 },
    '将軍': { referrals: 50, volume: 300000 }
  }

  const req = requirements[nextLevel as keyof typeof requirements]
  if (!req) return 0

  const referralProgress = Math.min(directReferrals / req.referrals, 1)
  const volumeProgress = Math.min(totalVolume / req.volume, 1)
  
  return Math.min(referralProgress, volumeProgress) * 100
}

export async function createReferralLink(userId: string, baseUrl: string): Promise<string> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()

  if (error || !profile?.referral_code) {
    const newCode = await generateReferralCode(userId)
    
    await supabase
      .from('profiles')
      .update({ referral_code: newCode })
      .eq('id', userId)

    return `${baseUrl}/register?ref=${newCode}`
  }

  return `${baseUrl}/register?ref=${profile.referral_code}`
}
