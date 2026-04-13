'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS, ACHIEVEMENTS, getLevelForXp, getXpProgress, type UserRole, type AchievementType } from '@/lib/constants'
import type { Tables } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Zap, Target, Flame, BookOpen, ArrowRight } from 'lucide-react'

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header hero — gradient banner */}
      <div className="relative rounded-xl sm:rounded-2xl px-5 sm:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D46B9]/30 via-[#5B7BF5]/20 to-transparent rounded-xl sm:rounded-2xl" />
        <div className="absolute inset-0 border border-white/[0.08] rounded-xl sm:rounded-2xl" />

        <div className="relative z-10">
          <p className="text-white/40 text-[0.75rem] sm:text-[0.8125rem] font-medium uppercase tracking-wider">Кабинет</p>
          <h1 className="text-[1.25rem] sm:text-[1.75rem] font-extrabold mt-1 tracking-tight text-white">{user.name}</h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-4 sm:mt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/[0.08] flex items-center justify-center text-base sm:text-lg">
                {level.icon}
              </div>
              <div>
                <p className="text-[0.8125rem] sm:text-[0.9375rem] font-bold text-white">{level.name}</p>
                <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/30">Уровень {level.level}</p>
              </div>
            </div>

            <div className="h-8 sm:h-10 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-6 sm:gap-8">
              <div>
                <p className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-white">{user.xp}</p>
                <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/30">баллов</p>
              </div>
              <div>
                <p className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-white">{user.current_streak}</p>
                <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/30">Серия</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { icon: Zap, label: 'Прогресс уровня', value: `${xpProgress}%`, showProgress: true },
          { icon: Target, label: 'Роль', value: ROLE_LABELS[user.role as UserRole], showProgress: false },
          { icon: Flame, label: 'Макс. серия', value: `${user.max_streak} подряд`, showProgress: false },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2D46B9]/20 flex items-center justify-center shrink-0">
              <stat.icon className="w-5 h-5 text-[#5B7BF5]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.8125rem] text-white/40 font-medium">{stat.label}</p>
              <p className="text-[1rem] sm:text-[1.125rem] font-bold text-white">{stat.value}</p>
              {stat.showProgress && (
                <div className="mt-1.5 w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2D46B9] to-[#5B7BF5] rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Achievements */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-[1rem] sm:text-[1.0625rem] font-bold text-white">Значки</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {(Object.entries(ACHIEVEMENTS) as [AchievementType, typeof ACHIEVEMENTS[AchievementType]][]).map(
                ([type, info]) => {
                  const earned = achievements.some((a) => a.type === type)
                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        earned
                          ? 'bg-[#2D46B9]/10 border border-[#2D46B9]/20'
                          : 'bg-white/[0.02] border border-white/[0.04] opacity-40'
                      }`}
                    >
                      <span className="text-[1.5rem]">{info.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-[0.8125rem] font-semibold ${earned ? 'text-[#5B7BF5]' : 'text-white/30'}`}>
                          {info.name}
                        </p>
                        <p className="text-[0.6875rem] text-white/25 truncate">{info.description}</p>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>

        {/* Modules + recent activity */}
        <div className="space-y-5 sm:space-y-6">
          {/* Quick modules */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-[1rem] sm:text-[1.0625rem] font-bold text-white">Мои модули</h2>
              <Link href="/modules">
                <Button variant="ghost" size="sm" className="text-[#5B7BF5] hover:text-[#8BA3FC] hover:bg-white/[0.04] gap-1 text-[0.8125rem] font-semibold">
                  Все <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-3 sm:p-4 space-y-1">
              {userModules.slice(0, 4).map((mod) => (
                <Link
                  key={mod.id}
                  href={`/modules/${mod.id}/test`}
                  className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D46B9] to-[#5B7BF5] flex items-center justify-center text-white text-[0.8125rem] font-bold shrink-0">
                    {mod.order_index}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8125rem] sm:text-[0.875rem] font-semibold text-white/80 group-hover:text-white transition-colors truncate">{mod.title}</p>
                    <p className="text-[0.6875rem] sm:text-[0.75rem] text-white/25 truncate">{mod.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-[#5B7BF5] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-[1rem] sm:text-[1.0625rem] font-bold text-white">Последние результаты</h2>
            </div>
            <div className="p-3 sm:p-4">
              {attempts.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <BookOpen className="w-10 h-10 text-white/10 mx-auto" />
                  <p className="text-[0.875rem] text-white/30 mt-3">Вы ещё не проходили тесты</p>
                  <Link href="/modules">
                    <Button size="sm" className="mt-4 bg-gradient-to-r from-[#2D46B9] to-[#5B7BF5] hover:from-[#233A9E] hover:to-[#4A6AE5] rounded-lg font-semibold text-[0.8125rem]">
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
                      <div key={a.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] gap-2">
                        <span className="text-[0.8125rem] sm:text-[0.875rem] font-medium text-white/70 truncate">{mod?.title ?? 'Модуль'}</span>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span className="text-[0.6875rem] sm:text-[0.75rem] px-2 sm:px-2.5 py-1 rounded-full bg-[#2D46B9]/15 text-[#5B7BF5] font-bold">
                            {pct}%
                          </span>
                          <span className="text-[0.75rem] sm:text-[0.8125rem] font-bold text-[#5B7BF5]">+{a.xp_earned} б.</span>
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
