import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ApiError, getToken, isNetworkError, setToken } from './api/client'

const PUBLIC_PATHS = ['/', '/login', '/register']

// 401 dari respons mana pun berarti sesi habis: token dibuang dan pengguna
// diarahkan ke login (kecuali memang sedang di halaman publik).
function handleGlobalApiError(err: unknown) {
  if (err instanceof ApiError && err.status === 401) {
    if (getToken()) setToken(null)
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      window.location.assign('/login?sesi=habis')
    }
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalApiError }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError) return false
        if (error instanceof DOMException && error.name === 'AbortError') return false
        return isNetworkError(error) && failureCount < 2
      },
      staleTime: 15_000,
    },
    mutations: { onError: handleGlobalApiError },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
