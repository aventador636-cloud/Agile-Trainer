'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user-store'
import { ROLE_LABELS, ROLE_BY_LABEL, type UserRole } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Zap, Users } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !role) return

    setLoading(true)
    setError('')

    const trimmedName = name.trim()

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('name', trimmedName)
      .eq('role', role)
      .single()

    if (existing) {
      setUser(existing)
      router.push('/modules')
      return
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ name: trimmedName, role })
      .select()
      .single()

    if (insertError) {
      setError('Ошибка при создании профиля. Попробуйте ещё раз.')
      setLoading(false)
      return
    }

    setUser(newUser)
    router.push('/modules')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0F1E]">
      {/* Animated gradient mesh background — smooth slow drift */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-[#2D46B9]/25 rounded-full blur-[150px] -translate-x-1/3 -translate-y-1/3 animate-[gpb-drift-1_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#5B7BF5]/15 rounded-full blur-[130px] translate-x-1/4 translate-y-1/4 animate-[gpb-drift-2_25s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2 animate-[gpb-drift-3_22s_ease-in-out_infinite]" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top nav bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D46B9] to-[#5B7BF5] flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-5 h-5 gpb-logo-spin" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="20" cy="22" r="11" />
              <path d="M9 22 C9 14, 15 9, 22 9" />
              <path d="M22 9 C26 9, 30 12, 30 16" />
            </svg>
          </div>
          <span className="text-white font-bold text-[1rem] tracking-tight">Agile Trainer</span>
          <span className="text-white/30 text-[0.75rem] font-medium ml-1 hidden sm:inline">v2.4</span>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-[0.75rem]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Система активна</span>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] px-5 sm:px-10 gap-10 lg:gap-20">

        {/* Left: Hero text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[0.75rem] font-medium mb-6">
            <svg viewBox="0 0 40 40" className="w-4 h-4" fill="none" stroke="#5B7BF5" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="20" cy="22" r="11" />
              <path d="M9 22 C9 14, 15 9, 22 9" />
              <path d="M22 9 C26 9, 30 12, 30 16" />
            </svg>
            ГПБ Agile PlayBook v2.4
          </div>

          <h1 className="text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-tight">
            Agile Skills
            <br />
            <span className="bg-gradient-to-r from-[#5B7BF5] to-[#8BA3FC] bg-clip-text text-transparent">
              Trainer
            </span>
          </h1>

          <p className="text-white/50 text-[0.9375rem] sm:text-[1.0625rem] mt-5 leading-relaxed max-w-md mx-auto lg:mx-0">
            Интерактивный тренажёр для развития Agile-навыков. Тесты, симуляции и геймификация.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
            {[
              { icon: Shield, label: 'Тесты по PlayBook' },
              { icon: Zap, label: 'Балльная система' },
              { icon: Users, label: 'Ролевые сценарии' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 text-white/50 text-[0.8125rem]">
                <f.icon className="w-4 h-4 text-[#5B7BF5]" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="w-full max-w-[420px] shrink-0">
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-7 sm:p-9 shadow-2xl shadow-black/20">
            <div className="mb-7">
              <h2 className="text-[1.375rem] sm:text-[1.5rem] font-bold text-white tracking-tight">Вход в тренажёр</h2>
              <p className="text-white/40 mt-1.5 text-[0.875rem]">Введите данные для начала обучения</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/60 font-medium text-[0.8125rem]">ФИО сотрудника</Label>
                <Input
                  id="name"
                  placeholder="Иванов Иван Иванович"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:bg-white/[0.08] focus:border-[#5B7BF5]/50 focus:ring-[#5B7BF5]/20 text-[0.9375rem]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/60 font-medium text-[0.8125rem]">Роль в команде</Label>
                <Select
                  value={role ? ROLE_LABELS[role] : undefined}
                  onValueChange={(v) => {
                    const key = ROLE_BY_LABEL[v as string]
                    if (key) setRole(key)
                  }}
                >
                  <SelectTrigger id="role" className="h-12 rounded-xl bg-white/[0.06] border-white/[0.08] text-white text-[0.9375rem] [&>span]:text-white/25 data-[state=open]:border-[#5B7BF5]/50">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F35] border-white/10 text-white">
                    {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={label} className="text-white/80 focus:bg-white/10 focus:text-white">
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-[0.8125rem] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-[0.9375rem] font-bold rounded-xl bg-gradient-to-r from-[#2D46B9] to-[#5B7BF5] hover:from-[#233A9E] hover:to-[#4A6AE5] transition-all shadow-lg shadow-[#2D46B9]/25 hover:shadow-[#2D46B9]/40"
                disabled={loading || !name.trim() || !role}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Загрузка...
                  </div>
                ) : (
                  'Войти в тренажёр'
                )}
              </Button>
            </form>

            {/* Trust footer */}
            <div className="mt-7 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-white/25 text-[0.6875rem]">
                <Shield className="w-3 h-3" />
                Защищённый вход
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="text-white/25 text-[0.6875rem]">
                Agile-трансформация ГПБ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
