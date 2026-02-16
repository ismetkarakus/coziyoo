import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Box, Button, CssBaseline, Paper, TextField, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { lightTheme, darkTheme } from './theme'
import Buyers from './pages/Buyers'
import Sellers from './pages/Sellers'
import SellerProfile from './pages/SellerProfile'
import BuyerProfile from './pages/BuyerProfile'
import Orders from './pages/Orders'
import Foods from './pages/Foods'
import Reviews from './pages/Reviews'
import Chats from './pages/Chats'
import Media from './pages/Media'
import AuditLogs from './pages/AuditLogs'
import { api } from './lib/api'
import type { DashboardSummary, OrderRecord } from './lib/api'

const initializeDarkMode = () => {
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const applyDarkMode = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', isDark.toString())
}

type StatCard = {
  label: string
  value: string
}

const formatCurrency = (value?: number) => {
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(safeValue)
}

const toDateString = (value: unknown) => {
  if (!value) return '—'
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('tr-TR')
}

function Dashboard() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [summary, orders] = await Promise.all([
        api.getDashboardSummary(),
        api.getOrders({ limit: 8 }),
      ])
      return { summary, orders }
    },
    staleTime: 15000,
  })
  const stats: DashboardSummary = data?.summary || {
    users: 0,
    foods: 0,
    orders: 0,
    chats: 0,
    reviews: 0,
    media: 0,
  }
  const recentOrders: OrderRecord[] = data?.orders || []

  const cards = useMemo<StatCard[]>(
    () => [
      { label: 'Users', value: stats.users.toString() },
      { label: 'Meals', value: stats.foods.toString() },
      { label: 'Orders', value: stats.orders.toString() },
      { label: 'Chats', value: stats.chats.toString() },
      { label: 'Reviews', value: stats.reviews.toString() },
      { label: 'Media', value: stats.media.toString() },
    ],
    [stats]
  )

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Cazi Admin</p>
          <h1>Operations Dashboard</h1>
          <p className="subtext">
            Single API source: <span className="mono">{api.baseUrl}</span>
          </p>
        </div>
        <div className="topbar-actions">
          <button className="ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}>Refresh</button>
        </div>
      </header>

      {error && (
        <div className="alert">
          <strong>API error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      <section className="stats">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <p className="card-label">{card.label}</p>
            <p className="card-value">{isLoading ? '—' : card.value}</p>
          </div>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
            <span className="panel-meta">{recentOrders.length} shown</span>
          </div>
          <div className="table">
            <div className="table-row table-head">
              <span>Order</span>
              <span>Buyer</span>
              <span>Seller</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {recentOrders.map((order) => (
              <div className="table-row" key={order.id}>
                <span className="mono">{order.id}</span>
                <span>{order.buyerName || order.buyerId || '—'}</span>
                <span>{order.cookName || order.sellerId || '—'}</span>
                <span>{formatCurrency(order.totalPrice)}</span>
                <span className={`status status-${order.status}`}>{order.status || '—'}</span>
                <span>{toDateString(order.orderDate || order.createdAt)}</span>
              </div>
            ))}
            {!isLoading && recentOrders.length === 0 && (
              <div className="empty">No orders found.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Coverage</h2>
          </div>
          <div className="actions">
            <Link className="ghost" to="/buyers">Manage buyers</Link>
            <Link className="ghost" to="/sellers">Manage sellers</Link>
            <Link className="ghost" to="/orders">Control orders</Link>
            <Link className="ghost" to="/foods">View foods</Link>
            <Link className="ghost" to="/reviews">Moderate reviews</Link>
            <Link className="ghost" to="/chats">Inspect chats</Link>
            <Link className="ghost" to="/media">Inspect media</Link>
            <Link className="ghost" to="/audit-logs">Audit logs</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(initializeDarkMode)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    applyDarkMode(newMode)
  }

  useEffect(() => {
    applyDarkMode(isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const token = api.getToken()
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false)
          setIsAuthChecking(false)
        }
        return
      }
      try {
        await api.adminMe()
        if (!cancelled) setIsAuthenticated(true)
      } catch (_error) {
        api.clearToken()
        if (!cancelled) setIsAuthenticated(false)
      } finally {
        if (!cancelled) setIsAuthChecking(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setAuthError(null)
      const result = await api.adminLogin(email, password)
      api.setToken(result.token)
      setIsAuthenticated(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed')
      setIsAuthenticated(false)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    api.clearToken()
    setIsAuthenticated(false)
  }

  if (isAuthChecking) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <Paper sx={{ p: 3 }}>Checking admin session...</Paper>
        </Box>
      </ThemeProvider>
    )
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
          <Paper sx={{ p: 3, width: '100%', maxWidth: 420, display: 'grid', gap: 2, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700}>Admin Login</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access protected admin endpoints.
            </Typography>
            <TextField
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              size="small"
              fullWidth
            />
            {authError && (
              <Typography color="error.main" variant="body2">{authError}</Typography>
            )}
            <Button variant="contained" onClick={handleLogin} disabled={isLoggingIn || !email || !password}>
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="shell">
          <header className="navbar">
            <div className="navbar-left">
              <div className="brand">
                <span className="brand-dot" />
                <div>
                  <p className="brand-title">Cazi Admin</p>
                  <p className="brand-subtitle">Single API</p>
                </div>
              </div>
              <nav className="nav">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/buyers" className="nav-link">Buyers</Link>
                <Link to="/sellers" className="nav-link">Sellers</Link>
                <Link to="/orders" className="nav-link">Orders</Link>
                <Link to="/foods" className="nav-link">Foods</Link>
                <Link to="/reviews" className="nav-link">Reviews</Link>
                <Link to="/chats" className="nav-link">Chats</Link>
                <Link to="/media" className="nav-link">Media</Link>
                <Link to="/audit-logs" className="nav-link">Audit</Link>
              </nav>
            </div>
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="ghost" onClick={handleLogout}>Logout</button>
          </header>
          <main className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/media" element={<Media />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/sellers/:id" element={<SellerProfile />} />
              <Route path="/buyers/:id" element={<BuyerProfile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
