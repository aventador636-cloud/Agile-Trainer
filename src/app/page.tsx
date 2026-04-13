'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user-store'
import { ROLE_LABELS, ROLE_BY_LABEL, type UserRole } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
      router.push('/dashboard')
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
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: PlayBook-style gradient hero */}
      <div className="hidden lg:flex lg:w-[55%] gpb-gradient relative overflow-hidden items-end p-16">
        {/* Triangular chevron decorations — PlayBook style */}
        <div className="absolute top-8 right-8 flex flex-col gap-2">
          <div className="w-0 h-0 border-l-[28px] border-r-[28px] border-b-[32px] border-l-transparent border-r-transparent border-b-white/15" />
          <div className="w-0 h-0 border-l-[28px] border-r-[28px] border-b-[32px] border-l-transparent border-r-transparent border-b-white/12 ml-7" />
          <div className="w-0 h-0 border-l-[28px] border-r-[28px] border-b-[32px] border-l-transparent border-r-transparent border-b-white/10 ml-14" />
        </div>
        {/* Large decorative chevron bottom-right */}
        <div className="absolute -bottom-20 -right-10 w-0 h-0 border-l-[160px] border-r-[160px] border-b-[200px] border-l-transparent border-r-transparent border-b-white/5" />
        <div className="absolute -bottom-10 right-20 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[130px] border-l-transparent border-r-transparent border-b-white/7" />

        <div className="relative z-10 text-white max-w-lg">
          {/* GPB-style spiral logo + agile team label */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center gpb-logo-spin">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 5 C30 5, 35 15, 35 20 C35 30, 25 35, 20 35 C10 35, 5 25, 5 20 C5 12, 12 8, 18 8 C24 8, 28 14, 28 20 C28 26, 22 30, 18 28" />
              </svg>
            </div>
          </div>

          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6">
            Agile Skills<br />Trainer
          </h1>

          <p className="text-lg font-semibold text-white/90 mb-2">
            ГПБ Agile PlayBook v2.4
          </p>
          <p className="text-base text-white/60 leading-relaxed">
            Интерактивный тренажёр Agile-навыков
          </p>
        </div>

        {/* Top right: agile team brand */}
        <div className="absolute top-8 right-28 flex items-center gap-2 text-white/80">
          <svg viewBox="0 0 40 40" className="w-8 h-8 gpb-logo-spin" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7">
            <circle cx="20" cy="20" r="15" />
            <path d="M14 20 C14 14, 20 10, 26 14" />
          </svg>
          <span className="text-lg tracking-wide font-light">
            agile<sup className="text-xs ml-0.5 opacity-60">team</sup>
          </span>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-extrabold text-[#2D46B9] tracking-tight">Agile Skills Trainer</h1>
            <p className="text-[#6B7280] mt-2 text-sm">ГПБ Agile PlayBook v2.4</p>
          </div>

          <div className="mb-8">
            <h2 className="text-[1.75rem] font-extrabold text-[#1A2340] tracking-tight">Добро пожаловать</h2>
            <p className="text-[#6B7280] mt-2 text-[0.9375rem]">Введите данные для входа в тренажёр</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1A2340] font-semibold text-sm">ФИО</Label>
              <Input
                id="name"
                placeholder="Иванов Иван Иванович"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg border-[#E5E8F0] bg-[#F9FAFB] focus:bg-white focus:border-[#2D46B9] focus:ring-[#2D46B9]/20 text-[0.9375rem] placeholder:text-[#9CA3AF]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#1A2340] font-semibold text-sm">Роль в команде</Label>
              <Select
                value={role ? ROLE_LABELS[role] : undefined}
                onValueChange={(v) => {
                  const key = ROLE_BY_LABEL[v as string]
                  if (key) setRole(key)
                }}
              >
                <SelectTrigger id="role" className="h-12 rounded-lg border-[#E5E8F0] bg-[#F9FAFB] text-[0.9375rem]">
                  <SelectValue placeholder="Выберите вашу роль" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={label}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-[0.9375rem] font-bold rounded-lg bg-[#2D46B9] hover:bg-[#233A9E] transition-colors"
              disabled={loading || !name.trim() || !role}
            >
              {loading ? 'Загрузка...' : 'Войти в тренажёр'}
            </Button>
          </form>

          <p className="text-xs text-center text-[#9CA3AF] mt-8 leading-relaxed">
            Платформа доступна сотрудникам,<br />
            участвующим в Agile-трансформации
          </p>
        </div>
      </div>
    </div>
  )
}
