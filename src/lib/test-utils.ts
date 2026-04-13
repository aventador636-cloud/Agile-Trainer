import { supabase } from './supabase'
import { XP_RULES, getLevelForXp } from './constants'

export interface QuestionOption {
  id: string
  text: string
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateQuestionXp(attemptNumber: 1 | 2, isCorrect: boolean): number {
  if (!isCorrect) return 0
  return attemptNumber === 1 ? XP_RULES.CORRECT_FIRST_TRY : XP_RULES.CORRECT_SECOND_TRY
}

export function calculateStreakBonus(oldStreak: number, newStreak: number): number {
  if (newStreak <= oldStreak) return 0
  const oldBonuses = Math.floor(oldStreak / 5)
  const newBonuses = Math.floor(newStreak / 5)
  return (newBonuses - oldBonuses) * XP_RULES.STREAK_BONUS_5
}

export function calculateEndBonuses(correctCount: number, totalQuestions: number) {
  let bonus = XP_RULES.MODULE_COMPLETE
  let perfect = false
  if (correctCount === totalQuestions && totalQuestions > 0) {
    bonus += XP_RULES.PERFECT_MODULE
    perfect = true
  }
  return { bonus, perfect }
}

export async function checkAndAwardAchievements(
  userId: string,
  testResult: { correctCount: number; totalQuestions: number; maxStreak: number }
): Promise<string[]> {
  const { data: existing } = await supabase
    .from('achievements')
    .select('type')
    .eq('user_id', userId)

  const earned = new Set(existing?.map((a) => a.type) ?? [])
  const toAward: string[] = []

  // first_step: any module complete
  if (!earned.has('first_step')) toAward.push('first_step')

  // perfectionist: 100% score
  if (!earned.has('perfectionist') && testResult.correctCount === testResult.totalQuestions && testResult.totalQuestions > 0)
    toAward.push('perfectionist')

  // streamer: 10 in a row
  if (!earned.has('streamer') && testResult.maxStreak >= 10)
    toAward.push('streamer')

  if (toAward.length > 0) {
    await supabase
      .from('achievements')
      .insert(toAward.map((type) => ({ user_id: userId, type })))
  }

  return toAward
}

export async function persistTestCompletion(
  userId: string,
  attemptId: string,
  score: number,
  totalQuestions: number,
  totalXp: number,
  newStreak: number,
  maxStreakInSession: number,
  currentUserXp: number,
  currentMaxStreak: number
) {
  // Update test attempt
  await supabase
    .from('test_attempts')
    .update({ score, xp_earned: totalXp, completed_at: new Date().toISOString() })
    .eq('id', attemptId)

  // Calculate new user stats
  const newXp = currentUserXp + totalXp
  const newLevel = getLevelForXp(newXp).level
  const newMaxStreak = Math.max(currentMaxStreak, maxStreakInSession)

  // Update user
  const { data: updatedUser } = await supabase
    .from('users')
    .update({
      xp: newXp,
      level: newLevel,
      current_streak: newStreak,
      max_streak: newMaxStreak,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  return updatedUser
}
