import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { api } from '../lib/api'
import type { UserRecord } from '../lib/api'

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const SellerProfile = () => {
  const { id } = useParams()
  const [seller, setSeller] = useState<UserRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getUser(id)
        if (!cancelled) setSeller(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load seller')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography>Loading seller...</Typography>
      </Paper>
    )
  }

  if (!seller || error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Seller not found
        </Typography>
        {error && <Typography color="error.main">{error}</Typography>}
        <Button component={Link} to="/sellers" sx={{ mt: 2 }}>
          Back to Sellers
        </Button>
      </Paper>
    )
  }

  const displayName = String(seller.displayName || seller.email || 'Seller')

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 84, height: 84 }}>
            {displayName.slice(0, 1).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {displayName}
            </Typography>
            <Typography color="text.secondary">{String(seller.email || '—')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={String(seller.userType || 'seller')} />
              <Chip label={String(seller.status || '—')} />
              <Chip label={`UID: ${String(seller.uid || seller.id || '—')}`} />
            </Stack>
          </Box>
          <Button component={Link} to="/sellers">
            Back to Sellers
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr' } }}>
        <Box>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Contact
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography>Email: {formatValue(seller.email)}</Typography>
              <Typography>Phone: {formatValue(seller.phone)}</Typography>
              <Typography>Status: {formatValue(seller.status)}</Typography>
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Raw Data
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(seller, null, 2)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Stack>
  )
}

export default SellerProfile
