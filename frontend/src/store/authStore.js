import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,  // 标记是否已从 localStorage 恢复
      
      login: (token, user) => set({ 
        token, 
        user, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        token: null, 
        user: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (user) => set({ user }),
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'health-auth-storage',
      onRehydrateStorage: () => (state) => {
        // 当从 localStorage 恢复完成时调用
        state?.setHasHydrated(true)
      },
    }
  )
)

