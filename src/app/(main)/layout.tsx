'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/user-store'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS, LEVELS, getLevelForXp, getXpProgress, type UserRole } from '@/lib/constants'
import { BookOpen, Shield, LogOut, Trophy, ChevronRight, Menu, X, Camera } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/modules', icon: BookOpen, label: 'Модули' },
  { href: '/admin', icon: Shield, label: 'Админка' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useUserStore((s) => s.user)
  const hydrated = useUserStore((s) => s.hydrated)
  const setUser = useUserStore((s) => s.setUser)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (hydrated && !user) router.replace('/')
  }, [hydrated, user, router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    const url = `${publicUrl}?t=${Date.now()}`

    await supabase.from('users').update({ avatar_url: url }).eq('id', user.id)
    setUser({ ...user, avatar_url: url })
    setUploading(false)
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!hydrated || !user) return null

  const level = getLevelForXp(user.xp)
  const xpProgress = getXpProgress(user.xp)
  const pointsToNext = level.maxXp === Infinity ? 0 : level.maxXp - user.xp
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1]

  function handleLogout() {
    setUser(null)
    router.replace('/')
  }

  const sidebarContent = (
    <>
      {/* Brand header */}
      <div className="px-6 pt-6 pb-5">
        <Link href="/modules" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-5 h-5 gpb-logo-spin" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="20" cy="22" r="11" />
              <path d="M9 22 C9 14, 15 9, 22 9" />
              <path d="M22 9 C26 9, 30 12, 30 16" />
            </svg>
          </div>
          <div>
            <span className="text-[1.0625rem] font-bold tracking-tight block leading-tight text-white group-hover:text-white/80 transition-colors">Agile Trainer</span>
            <span className="text-[0.6875rem] text-white/50 font-medium">PlayBook v2.4</span>
          </div>
        </Link>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* User card */}
      <div className="mx-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-10 h-10 rounded-full shrink-0 group"
          >
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20" />
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[0.875rem] truncate text-white">{user.name}</p>
            <p className="text-[0.75rem] text-white/60">{ROLE_LABELS[user.role as UserRole]}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-white/70" />
          <span className="text-[0.8125rem] font-medium text-white/80">{level.name}</span>
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between text-[0.6875rem] text-white/50 mb-1.5">
            <span>{user.xp} б.</span>
            <span>{level.maxXp === Infinity ? 'MAX' : level.maxXp}</span>
          </div>
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/70 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          {nextLevel ? (
            <p className="text-[0.6875rem] text-white/40 mt-1.5">
              Ещё <span className="text-white/70 font-semibold">{pointsToNext}</span> б. до «{nextLevel.name}»
            </p>
          ) : (
            <p className="text-[0.6875rem] text-white/50 mt-1.5 font-medium">Максимальный грейд</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.875rem] font-medium transition-all ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-white/40" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[0.875rem] font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-all w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Выйти
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      {/* Desktop sidebar — PlayBook blue gradient */}
      <aside className="hidden lg:flex w-[280px] gpb-sidebar-gradient flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile header — PlayBook blue */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 gpb-gradient">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/modules" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-5 h-5 gpb-logo-spin" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="20" cy="22" r="11" />
                <path d="M9 22 C9 14, 15 9, 22 9" />
                <path d="M22 9 C26 9, 30 12, 30 16" />
              </svg>
            </div>
            <span className="text-white font-bold text-[0.9375rem]">Agile Trainer</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-[0.75rem] font-semibold">{user.xp} б.</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] gpb-sidebar-gradient flex flex-col overflow-auto">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-[60px]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
