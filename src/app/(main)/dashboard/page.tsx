'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS, ACHIEVEMENTS, getLevelForXp, getXpProgress, type UserRole, type AchievementType } from '@/lib/constants'
import type { Tables } from '@/lib/database.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Target, Flame, BookOpen, ArrowRight, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const user = useUserStore((s) => s.user)
  const [achievements, setAchievements] = useState<Tables<'achievements'>[]>([])
  const [modules, setModules] = useState<Tables<'modules'>[]>([])
  const [attempts, setAttempts] = useState<Tables<'test_attempts'>[]>([])

  useEffect(() => {
    if (!user) return

    Promise.all([
      supabase.from('achievements').select('*').eq('user_id', user.id),
      supabase.from('modules').select('*').order('order_index'),
      supabase.from('test_attempts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5),
    ]).then(([achRes, modRes, attRes]) => {
      if (achRes.data) setAchievements(achRes.data)
      if (modRes.data) setModules(modRes.data)
      if (attRes.data) setAttempts(attRes.data)
    })
  }, [user])

  if (!user) return null

  const level = getLevelForXp(user.xp)
  const xpProgress = getXpProgress(user.xp)
  const userModules = modules.filter((m) => m.roles.includes(user.role))

  return (
    <div className="space-y-8">
      {/* Header hero — PlayBook gradient with chevron decorations */}
      <div className="gpb-gradient rounded-2xl px-8 py-8 text-white relative overflow-hidden">
        {/* Chevron decorations */}
        <div className="absolute top-4 right-6 flex flex-col gap-1.5 opacity-40">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[22px] border-l-transparent border-r-transparent border-b-white" />
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[22px] border-l-transparent border-r-transparent border-b-white ml-4" />
        </div>
        <div className="absolute -bottom-8 -right-4 w-0 h-0 border-l-[80px] border-r-[80px] border-b-[100px] border-l-transparent border-r-transparent border-b-white/5" />

        <div className="relative z-10">
          <p className="text-white/60 text-[0.8125rem] font-medium uppercase tracking-wider">Кабинет</p>
          <h1 className="text-[1.75rem] font-extrabold mt-1 tracking-tight">{user.name}</h1>

          <div className="flex items-center gap-8 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-lg">
                {level.icon}
              </div>
              <div>
                <p className="text-[0.9375rem] font-bold">{level.name}</p>
                <p className="text-[0.75rem] text-white/50">Уровень {level.level}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/15" />

            <div>
              <p className="text-[1.5rem] font-extrabold">{user.xp}</p>
              <p className="text-[0.75rem] text-white/50">XP</p>
            </div>

            <div className="h-10 w-px bg-white/15" />

            <div>
              <p className="text-[1.5rem] font-extrabold">{user.current_streak}</p>
              <p className="text-[0.75rem] text-white/50">Серия</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row — PlayBook clean card style */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="gpb-card p-5 flex items-center gap-4">
          <div className="gpb-number-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[0.8125rem] text-[#6B7280] font-medium">Прогресс уровня</p>
            <p className="text-[1.25rem] font-extrabold text-[#1A2340]">{xpProgress}%</p>
            <div className="mt-1.5 w-full h-1.5 bg-[#F0F3FA] rounded-full overflow-hidden">
              <div className="h-full bg-[#2D46B9] rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="gpb-card p-5 flex items-center gap-4">
          <div className="gpb-number-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[0.8125rem] text-[#6B7280] font-medium">Роль</p>
            <p className="text-[1.125rem] font-bold text-[#1A2340]">{ROLE_LABELS[user.role as UserRole]}</p>
          </div>
        </div>

        <div className="gpb-card p-5 flex items-center gap-4">
          <div className="gpb-number-lg">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[0.8125rem] text-[#6B7280] font-medium">Макс. серия</p>
            <p className="text-[1.125rem] font-bold text-[#1A2340]">{user.max_streak} ответов подряд</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Achievements — PlayBook card style */}
        <div className="gpb-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E8F0] flex items-center gap-2">
            <h2 className="text-[1.0625rem] font-bold text-[#1A2340]">Значки</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(ACHIEVEMENTS) as [AchievementType, typeof ACHIEVEMENTS[AchievementType]][]).map(
                ([type, info]) => {
                  const earned = achievements.some((a) => a.type === type)
                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        earned
                          ? 'bg-[#F0F3FA] border border-[#2D46B9]/15'
                          : 'bg-[#F9FAFB] opacity-45'
                      }`}
                    >
                      <span className="text-[1.5rem]">{info.icon}</span>
                      <div>
                        <p className={`text-[0.8125rem] font-semibold ${earned ? 'text-[#2D46B9]' : 'text-[#9CA3AF]'}`}>
                          {info.name}
                        </p>
                        <p className="text-[0.6875rem] text-[#9CA3AF]">{info.description}</p>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>

        {/* Modules + recent activity */}
        <div className="space-y-6">
          {/* Quick modules */}
          <div className="gpb-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E8F0] flex items-center justify-between">
              <h2 className="text-[1.0625rem] font-bold text-[#1A2340]">Мои модули</h2>
              <Link href="/modules">
                <Button variant="ghost" size="sm" className="text-[#2D46B9] hover:text-[#233A9E] gap-1 text-[0.8125rem] font-semibold">
                  Все <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-4 space-y-1">
              {userModules.slice(0, 4).map((mod) => (
                <Link
                  key={mod.id}
                  href={`/modules/${mod.id}/test`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F3FA] transition-colors group"
                >
                  <div className="gpb-number">
                    {mod.order_index}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.875rem] font-semibold text-[#1A2340] group-hover:text-[#2D46B9] transition-colors">{mod.title}</p>
                    <p className="text-[0.75rem] text-[#9CA3AF] truncate">{mod.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#2D46B9] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="gpb-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E8F0]">
              <h2 className="text-[1.0625rem] font-bold text-[#1A2340]">Последние результаты</h2>
            </div>
            <div className="p-4">
              {attempts.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-[#D1D5DB] mx-auto" />
                  <p className="text-[0.875rem] text-[#9CA3AF] mt-3">Вы ещё не проходили тесты</p>
                  <Link href="/modules">
                    <Button size="sm" className="mt-4 bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg font-semibold text-[0.8125rem]">
                      Начать обучение
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attempts.map((a) => {
                    const mod = modules.find((m) => m.id === a.module_id)
                    const pct = a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                        <span className="text-[0.875rem] font-medium text-[#1A2340]">{mod?.title ?? 'Модуль'}</span>
                        <div className="flex items-center gap-3">
                          <span className="gpb-pill-light text-[0.75rem] px-2.5 py-1 rounded-full font-bold">
                            {pct}%
                          </span>
                          <span className="text-[0.8125rem] font-bold text-[#2D46B9]">+{a.xp_earned} XP</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
