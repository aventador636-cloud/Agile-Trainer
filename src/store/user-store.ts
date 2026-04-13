'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tables } from '@/lib/database.types'

type User = Tables<'users'>

interface UserState {
  user: User | null
  hydrated: boolean
  setUser: (user: User | null) => void
  setHydrated: (v: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'agile-trainer-user',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
