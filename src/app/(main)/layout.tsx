'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/store/user-store'
import { ROLE_LABELS, getLevelForXp, getXpProgress, type UserRole } from '@/lib/constants'
import { LayoutDashboard, BookOpen, Shield, LogOut, Trophy, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Кабинет' },
  { href: '/modules', icon: BookOpen, label: 'Модули' },
  { href: '/admin', icon: Shield, label: 'Админка' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useUserStore((s) => s.user)
  const hydrated = useUserStore((s) => s.hydrated)
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    if (hydrated && !user) router.replace('/')
  }, [hydrated, user, router])

  if (!hydrated || !user) return null

  const level = getLevelForXp(user.xp)
  const xpProgress = getXpProgress(user.xp)

  function handleLogout() {
    setUser(null)
    router.replace('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Sidebar — PlayBook gradient style */}
      <aside className="w-[280px] gpb-sidebar-gradient flex flex-col text-white shrink-0 relative overflow-hidden">
        {/* Subtle decorative chevrons */}
        <div className="absolute bottom-6 right-4 opacity-10">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[24px] border-l-transparent border-r-transparent border-b-white" />
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[24px] border-l-transparent border-r-transparent border-b-white mt-1 ml-5" />
        </div>

        {/* Brand header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center gpb-logo-spin">
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M20 5 C30 5, 35 15, 35 20 C35 30, 25 35, 20 35 C10 35, 5 25, 5 20 C5 12, 12 8, 18 8 C24 8, 28 14, 28 20 C28 26, 22 30, 18 28" />
              </svg>
            </div>
            <div>
              <span className="text-[1.0625rem] font-bold tracking-tight block leading-tight">Agile Trainer</span>
              <span className="text-[0.6875rem] text-white/50 font-medium">PlayBook v2.4</span>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[0.875rem] truncate">{user.name}</p>
              <p className="text-[0.75rem] text-white/60">{ROLE_LABELS[user.role as UserRole]}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white/70" />
            <span className="text-[0.8125rem] font-medium">{level.icon} {level.name}</span>
          </div>
          <div className="mt-2.5">
            <div className="flex justify-between text-[0.6875rem] text-white/50 mb-1.5">
              <span>{user.xp} XP</span>
              <span>{level.maxXp === Infinity ? 'MAX' : level.maxXp}</span>
            </div>
            <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
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
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
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
        <div className="p-3 mt-auto border-t border-white/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[0.875rem] font-medium text-white/40 hover:bg-white/8 hover:text-white/70 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1120px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
