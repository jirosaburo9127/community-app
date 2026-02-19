import { createClient } from './client'
import { Challenge } from '@/lib/types'

export async function getChallenges() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data as Challenge[]
}

export async function createChallenge(input: {
  title: string
  description: string
  category?: string
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      creator_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  return data
}
