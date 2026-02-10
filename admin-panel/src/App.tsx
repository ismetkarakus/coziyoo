import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import { db } from './lib/firebase'
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore'
import Buyers from './pages/Buyers'
import Sellers from './pages/Sellers'
import SellerProfile from './pages/SellerProfile'
import BuyerProfile from './pages/BuyerProfile'

// Dark mode desteğini ekle
const initializeDarkMode = () => {
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) {
    return stored === 'true'
  }
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
  helper?: string
}

type OrderRow = {
  id: string
  buyerName?: string
  cookName?: string
  totalPrice?: number
  status?: string
  createdAt?: string
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
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('tr-TR')
  }
  if (typeof value === 'object') {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number }
    if (maybeTimestamp.toDate) {
      return maybeTimestamp.toDate().toLocaleString('tr-TR')
    }
    if (typeof maybeTimestamp.seconds === 'number') {
      return new Date(maybeTimestamp.seconds * 1000).toLocaleString('tr-TR')
    }
  }
  return '—'
}

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    foods: 0,
    orders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const usersRef = collection(db, 'users')
        const foodsRef = collection(db, 'foods')
        const ordersRef = collection(db, 'orders')

        const [usersSnap, foodsSnap, ordersSnap] = await Promise.all([
          getCountFromServer(usersRef),
          getCountFromServer(foodsRef),
          getCountFromServer(ordersRef),
        ])

        setStats({
          users: usersSnap.data().count,
          foods: foodsSnap.data().count,
          orders: ordersSnap.data().count,
        })

        const recentOrdersQuery = query(
          ordersRef,
          orderBy('createdAt', 'desc'),
          limit(8)
        )
        const recentOrdersSnap = await getDocs(recentOrdersQuery)
        const ordersData = recentOrdersSnap.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            buyerName: data.buyerName || data.customerName || '—',
            cookName: data.cookName || data.sellerName || '—',
            totalPrice: data.totalPrice || data.total || 0,
            status: data.status || '—',
            createdAt: toDateString(data.createdAt),
          }
        })

        setRecentOrders(ordersData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const cards = useMemo<StatCard[]>(
    () => [
      { label: 'Users', value: stats.users.toString() },
      { label: 'Meals', value: stats.foods.toString() },
      { label: 'Orders', value: stats.orders.toString() },
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
            Live stats from Firestore with recent orders and quick metrics.
          </p>
        </div>
        <div className="topbar-actions">
          <button className="ghost">Refresh</button>
          <button className="primary">Add Seller</button>
        </div>
      </header>

      {error && (
        <div className="alert">
          <strong>Firebase error:</strong> {error}
        </div>
      )}

      <section className="stats">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <p className="card-label">{card.label}</p>
            <p className="card-value">{isLoading ? '—' : card.value}</p>
            {card.helper && <p className="card-helper">{card.helper}</p>}
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
              <span>Created</span>
            </div>
            {recentOrders.map((order) => (
              <div className="table-row" key={order.id}>
                <span className="mono">{order.id}</span>
                <span>{order.buyerName}</span>
                <span>{order.cookName}</span>
                <span>{formatCurrency(order.totalPrice)}</span>
                <span className={`status status-${order.status}`}>{order.status}</span>
                <span>{order.createdAt}</span>
              </div>
            ))}
            {!isLoading && recentOrders.length === 0 && (
              <div className="empty">No orders found.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="actions">
            <button className="primary">Review Sellers</button>
            <button className="ghost">Flag Order</button>
            <button className="ghost">Export Report</button>
            <button className="ghost">Send Announcement</button>
          </div>
          <div className="divider" />
          <div className="panel-note">
            <p>
              Connect this panel to your Firebase Admin workflows next. The
              scaffold is ready for real-time data and auth gating.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(initializeDarkMode)

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    applyDarkMode(newMode)
  }

  useEffect(() => {
    applyDarkMode(isDarkMode)
  }, [isDarkMode])

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
                  <p className="brand-subtitle">Operations</p>
                </div>
              </div>
              <nav className="nav">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/buyers" className="nav-link">Buyers</Link>
                <Link to="/sellers" className="nav-link">Sellers</Link>
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
          </header>
          <main className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/sellers" element={<Sellers />} />
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
