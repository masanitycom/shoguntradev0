import { supabase } from './supabase'

export interface AirdropTask {
  id: number
  name: string
  description: string
  question: string
  choices: string[]
  reward_amount: number
  is_active: boolean
}

export interface TaskCompletion {
  id: string
  user_id: string
  task_id: number
  answer_choice: number
  completed_at: string
  reward_claimed: boolean
}

export async function getActiveAirdropTasks(): Promise<AirdropTask[]> {
  const { data, error } = await supabase
    .from('airdrop_tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch airdrop tasks')
  }

  return data || []
}

export async function getUserTaskCompletions(userId: string): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('user_task_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch user task completions')
  }

  return data || []
}

export async function completeTask(userId: string, taskId: number, answerChoice: number): Promise<boolean> {
  const { data: existingCompletion } = await supabase
    .from('user_task_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .single()

  if (existingCompletion) {
    return false
  }

  const { error } = await supabase
    .from('user_task_completions')
    .insert({
      user_id: userId,
      task_id: taskId,
      answer_choice: answerChoice,
      completed_at: new Date().toISOString(),
      reward_claimed: false
    })

  return !error
}

export async function calculateWeeklyAirdropReward(userId: string): Promise<number> {
  const startOfWeek = getStartOfWeek(new Date())
  const endOfWeek = getEndOfWeek(new Date())

  const { data: completions, error } = await supabase
    .from('user_task_completions')
    .select(`
      *,
      airdrop_tasks (reward_amount)
    `)
    .eq('user_id', userId)
    .gte('completed_at', startOfWeek.toISOString())
    .lte('completed_at', endOfWeek.toISOString())
    .eq('reward_claimed', false)

  if (error) {
    throw new Error('Failed to calculate weekly airdrop reward')
  }

  return completions?.reduce((total, completion) => {
    return total + (completion.airdrop_tasks?.reward_amount || 0)
  }, 0) || 0
}

export async function claimWeeklyAirdropReward(userId: string): Promise<number> {
  const startOfWeek = getStartOfWeek(new Date())
  const endOfWeek = getEndOfWeek(new Date())

  const { data: completions, error: fetchError } = await supabase
    .from('user_task_completions')
    .select(`
      *,
      airdrop_tasks (reward_amount)
    `)
    .eq('user_id', userId)
    .gte('completed_at', startOfWeek.toISOString())
    .lte('completed_at', endOfWeek.toISOString())
    .eq('reward_claimed', false)

  if (fetchError) {
    throw new Error('Failed to fetch completions for claiming')
  }

  const totalReward = completions?.reduce((total, completion) => {
    return total + (completion.airdrop_tasks?.reward_amount || 0)
  }, 0) || 0

  if (totalReward > 0) {
    const completionIds = completions?.map(c => c.id) || []
    
    const { error: updateError } = await supabase
      .from('user_task_completions')
      .update({ reward_claimed: true })
      .in('id', completionIds)

    if (updateError) {
      throw new Error('Failed to mark rewards as claimed')
    }

    const { data: currentProfile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('total_rewards')
      .eq('id', userId)
      .single()

    if (fetchProfileError) {
      throw new Error('Failed to fetch current profile')
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_rewards: (currentProfile.total_rewards || 0) + totalReward
      })
      .eq('id', userId)

    if (profileError) {
      throw new Error('Failed to update user rewards')
    }
  }

  return totalReward
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date)
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
}

export function isMonday(): boolean {
  return new Date().getDay() === 1
}

export async function getWeeklyTaskCompletionRate(): Promise<number> {
  const startOfWeek = getStartOfWeek(new Date())
  const endOfWeek = getEndOfWeek(new Date())

  const { data: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'user')

  const { data: completions, error: completionsError } = await supabase
    .from('user_task_completions')
    .select('user_id')
    .gte('completed_at', startOfWeek.toISOString())
    .lte('completed_at', endOfWeek.toISOString())

  if (usersError || completionsError) {
    return 0
  }

  const totalUserCount = totalUsers?.length || 0
  const uniqueCompletions = new Set(completions?.map(c => c.user_id) || []).size

  return totalUserCount > 0 ? (uniqueCompletions / totalUserCount) * 100 : 0
}
