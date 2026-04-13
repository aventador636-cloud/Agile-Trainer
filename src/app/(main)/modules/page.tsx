'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'
import { BookOpen, Play, Compass, Network, Users, Workflow, CalendarDays, Rocket, CheckCircle, Circle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MODULE_ICON_MAP: Record<number, { icon: LucideIcon; gradient: string }> = {
  1: { icon: Compass,      gradient: 'from-[#2D46B9] to-[#5B7BF5]' },
  2: { icon: Network,      gradient: 'from-[#6366F1] to-[#8B5CF6]' },
  3: { icon: Users,         gradient: 'from-[#0EA5E9] to-[#38BDF8]' },
  4: { icon: Workflow,     gradient: 'from-[#10B981] to-[#34D399]' },
  5: { icon: CalendarDays, gradient: 'from-[#F59E0B] to-[#FBBF24]' },
  6: { icon: Rocket,       gradient: 'from-[#EF4444] to-[#F87171]' },
}

const DEFAULT_ICON = { icon: BookOpen, gradient: 'from-[#2D46B9] to-[#5B7BF5]' }

interface ModuleAttempt {
  module_id: string
  score: number
  total_questions: number
}

export default function ModulesPage() {
  const user = useUserStore((s) => s.user)
  const [modules, setModules] = useState<Tables<'modules'>[]>([])
  const [attempts, setAttempts] = useState<ModuleAttempt[]>([])

  useEffect(() => {
    if (!user) return

    Promise.all([
      supabase.from('modules').select('*').order('order_index'),
      supabase
        .from('test_attempts')
        .select('module_id, score, total_questions')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null),
    ]).then(([modRes, attRes]) => {
      if (modRes.data) setModules(modRes.data)
      if (attRes.data) setAttempts(attRes.data)
    })
  }, [user])

  if (!user) return null

  const userModules = modules.filter((m) => m.roles.includes(user.role))

  function getBestAttempt(moduleId: string): { passed: boolean; pct: number } | null {
    const moduleAttempts = attempts.filter((a) => a.module_id === moduleId)
    if (moduleAttempts.length === 0) return null
    const best = moduleAttempts.reduce((best, cur) => {
      const curPct = cur.total_questions > 0 ? cur.score / cur.total_questions : 0
      const bestPct = best.total_questions > 0 ? best.score / best.total_questions : 0
      return curPct > bestPct ? cur : best
    })
    const pct = best.total_questions > 0 ? Math.round((best.score / best.total_questions) * 100) : 0
    return { passed: true, pct }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-[#2D46B9] tracking-tight">Модули обучения</h1>
        <p className="text-[0.75rem] sm:text-[0.875rem] text-[#6B7280] mt-0.5">Контент на основе ГПБ Agile PlayBook v2.4</p>
      </div>

      {/* Gradient divider */}
      <div className="h-[2px] bg-gradient-to-r from-[#2D46B9] via-[#5B7BF5] to-transparent" />

      {/* Module grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {userModules.map((mod) => {
          const { icon: Icon, gradient } = MODULE_ICON_MAP[mod.order_index] ?? DEFAULT_ICON
          const result = getBestAttempt(mod.id)
          return (
            <div key={mod.id} className="rounded-xl bg-white border border-[#E2E5F0] overflow-hidden group hover:shadow-lg hover:shadow-[#2D46B9]/8 transition-all">
              <div className="p-4 sm:p-5 pb-3 sm:pb-4">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-[0.8125rem] sm:text-[0.875rem] font-bold text-[#2D46B9] bg-[#EEF0F8] px-4 sm:px-4.5 py-2 rounded-full">
                    Модуль {mod.order_index}
                  </span>
                </div>

                <h3 className="text-[0.9375rem] sm:text-[1.0625rem] font-bold text-[#1A2340] group-hover:text-[#2D46B9] transition-colors leading-tight">
                  {mod.title}
                </h3>
                <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#6B7280] mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">{mod.description}</p>

                {/* Status badge */}
                <div className="mt-3">
                  {result ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[0.75rem] font-semibold text-emerald-700">Пройден</span>
                      <span className="text-[0.75rem] font-bold text-emerald-600 ml-1">{result.pct}%</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 animate-pulse">
                      <Circle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[0.75rem] font-semibold text-amber-600">Необходимо пройти</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2">
                <Link href={`/modules/${mod.id}/test`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-[#2D46B9] hover:bg-[#233A9E] rounded-lg gap-1.5 font-semibold text-[0.75rem] sm:text-[0.8125rem] h-8 sm:h-9"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {result ? 'Пересдать' : 'Тест'}
                  </Button>
                </Link>
                <Link href={`/modules/${mod.id}/simulation`} className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-[#2D46B9]/25 text-[#2D46B9] hover:bg-[#2D46B9] hover:text-white rounded-lg gap-1.5 font-semibold text-[0.75rem] sm:text-[0.8125rem] h-8 sm:h-9"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Симуляция
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
