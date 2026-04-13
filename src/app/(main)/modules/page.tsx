'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'
import { BookOpen, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MODULE_ICONS = ['🎯', '🏗️', '👥', '⚙️', '📅', '📊']

export default function ModulesPage() {
  const user = useUserStore((s) => s.user)
  const [modules, setModules] = useState<Tables<'modules'>[]>([])

  useEffect(() => {
    supabase
      .from('modules')
      .select('*')
      .order('order_index')
      .then(({ data }) => {
        if (data) setModules(data)
      })
  }, [])

  if (!user) return null

  const userModules = modules.filter((m) => m.roles.includes(user.role))

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D46B9]/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 40" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="#5B7BF5" strokeWidth="1.8">
            <circle cx="20" cy="20" r="14" />
            <ellipse cx="20" cy="20" rx="6" ry="14" />
            <path d="M7 15 Q13 17.5, 20 17 Q27 16.5, 33 15" />
            <path d="M7 25 Q13 22.5, 20 23 Q27 23.5, 33 25" />
          </svg>
        </div>
        <div>
          <h1 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-white tracking-tight">Модули обучения</h1>
          <p className="text-[0.75rem] sm:text-[0.875rem] text-white/30 mt-0.5">Контент на основе ГПБ Agile PlayBook v2.4</p>
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-[#2D46B9]/50 via-[#5B7BF5]/30 to-transparent" />

      {/* Module grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {userModules.map((mod, i) => (
          <div key={mod.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden group hover:border-[#2D46B9]/30 transition-all hover:bg-white/[0.05]">
            <div className="p-4 sm:p-5 pb-3 sm:pb-4">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#2D46B9] to-[#5B7BF5] flex items-center justify-center text-white text-[0.875rem] sm:text-[1rem] font-bold">
                    {mod.order_index}
                  </div>
                  <span className="text-[1.5rem] sm:text-[1.75rem]">{MODULE_ICONS[i] ?? '📘'}</span>
                </div>
                <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-[#5B7BF5] bg-[#2D46B9]/15 px-2 sm:px-2.5 py-1 rounded-full">
                  Модуль {mod.order_index}
                </span>
              </div>

              <h3 className="text-[0.9375rem] sm:text-[1.0625rem] font-bold text-white/90 group-hover:text-white transition-colors leading-tight">
                {mod.title}
              </h3>
              <p className="text-[0.75rem] sm:text-[0.8125rem] text-white/30 mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">{mod.description}</p>
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2">
              <Link href={`/modules/${mod.id}/test`} className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-[#2D46B9] to-[#5B7BF5] hover:from-[#233A9E] hover:to-[#4A6AE5] rounded-lg gap-1.5 font-semibold text-[0.75rem] sm:text-[0.8125rem] h-8 sm:h-9"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Тест
                </Button>
              </Link>
              <Link href={`/modules/${mod.id}/simulation`} className="flex-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-white/[0.1] text-white/60 hover:bg-white/[0.06] hover:text-white rounded-lg gap-1.5 font-semibold text-[0.75rem] sm:text-[0.8125rem] h-8 sm:h-9"
                >
                  <Play className="w-3.5 h-3.5" />
                  Симуляция
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
