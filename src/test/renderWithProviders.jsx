import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach } from 'vitest'
import { AuthContext } from '../features/auth/AuthContext.js'
import '../i18n/index.js'

// A suíte não usa `globals`, então o Testing Library não desmonta sozinho entre testes
afterEach(cleanup)

const GUEST_DISABLED = { status: 'disabled', user: null, signOut: async () => {} }

export function renderWithProviders(ui, { auth = GUEST_DISABLED, route = '/' } = {}) {
  // retry desligado: erro de query aparece na hora, sem timers reais
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}
