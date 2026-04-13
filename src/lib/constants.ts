export type UserRole = 'po' | 'scrum_master' | 'team_member'

export const ROLE_LABELS: Record<UserRole, string> = {
  po: 'Владелец Продукта',
  scrum_master: 'Scrum-мастер',
  team_member: 'Участник Команды',
}

export const ROLE_BY_LABEL: Record<string, UserRole> = Object.fromEntries(
  Object.entries(ROLE_LABELS).map(([k, v]) => [v, k as UserRole])
) as Record<string, UserRole>

export const XP_RULES = {
  CORRECT_FIRST_TRY: 10,
  CORRECT_SECOND_TRY: 5,
  MODULE_COMPLETE: 50,
  SIMULATION_COMPLETE: 100,
  STREAK_BONUS_5: 25,
  PERFECT_MODULE: 30,
} as const

export const LEVELS = [
  { level: 1, name: 'Agile Новичок', minXp: 0, maxXp: 200, icon: '🌱' },
  { level: 2, name: 'Участник Команды', minXp: 201, maxXp: 500, icon: '⚡' },
  { level: 3, name: 'Scrum-практик', minXp: 501, maxXp: 1000, icon: '🔲' },
  { level: 4, name: 'Владелец Продукта', minXp: 1001, maxXp: 2000, icon: '🚀' },
  { level: 5, name: 'Agile-коуч', minXp: 2001, maxXp: Infinity, icon: '🏆' },
] as const

export type AchievementType =
  | 'first_step'
  | 'perfectionist'
  | 'invincible'
  | 'role_expert'
  | 'ceremony_master'
  | 'all_rounder'
  | 'streamer'

export const ACHIEVEMENTS: Record<AchievementType, { name: string; description: string; icon: string }> = {
  first_step: { name: 'Первый шаг', description: 'Завершён первый модуль', icon: '👣' },
  perfectionist: { name: 'Перфекционист', description: '100% правильных ответов в тесте', icon: '💎' },
  invincible: { name: 'Непобедимый', description: 'Симуляция без единой ошибки', icon: '🛡️' },
  role_expert: { name: 'Знаток ролей', description: 'Завершён модуль «Ролевая модель»', icon: '🎭' },
  ceremony_master: { name: 'Мастер церемоний', description: 'Завершён модуль «События»', icon: '🎪' },
  all_rounder: { name: 'На все руки', description: 'Пройдены тесты за все три роли', icon: '🌟' },
  streamer: { name: 'Стримовый игрок', description: '10 правильных ответов подряд', icon: '🔥' },
}

export function getLevelForXp(xp: number) {
  return LEVELS.findLast((l) => xp >= l.minXp) ?? LEVELS[0]
}

export function getXpProgress(xp: number) {
  const level = getLevelForXp(xp)
  if (level.maxXp === Infinity) return 100
  const range = level.maxXp - level.minXp
  const progress = xp - level.minXp
  return Math.round((progress / range) * 100)
}
