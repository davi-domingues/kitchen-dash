import { createContext, useContext } from 'react'

// Sessão do app (AGENTS §5: Context para a sessão). status: loading | guest | authenticated | disabled
export const AuthContext = createContext({ status: 'disabled', user: null, signOut: async () => {} })

export function useAuth() {
  return useContext(AuthContext)
}
