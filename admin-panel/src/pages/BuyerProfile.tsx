import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import usersData from '../../../src/mock/users.json'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

type UserRecord = Record<string, unknown> & {
  id: string
  userType?: string
  displayName?: string
  email?: string
  phone?: string
  status?: string
  totalOrders?: number
  totalSpend?: number
  city?: string
  address?: string
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const BuyerProfile = () => {
  const { id } = useParams()

  const buyer = useMemo(() => {
    const allUsers = usersData as UserRecord[]
    return allUsers.find((user) => user.id === id) ?? null
  }, [id])

  if (!buyer) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Buyer not found
        </Typography>
        <Button component={Link} to="/buyers" sx={{ mt: 2 }}>
          Back to Buyers
        </Button>
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 84, height: 84 }}>
            {(buyer.displayName ?? 'B').slice(0, 1)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {buyer.displayName ?? '—'}
            </Typography>
            <Typography color="text.secondary">{buyer.email ?? '—'}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={buyer.userType ?? 'buyer'} />
              <Chip label={buyer.status ?? '—'} />
              <Chip label={`Orders: ${buyer.totalOrders ?? '—'}`} />
              <Chip label={`Spend: ₺${buyer.totalSpend ?? '—'}`} />
            </Stack>
          </Box>
          <Button component={Link} to="/buyers">
            Back to Buyers
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Contact & Location
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography>Email: {formatValue(buyer.email)}</Typography>
              <Typography>Phone: {formatValue(buyer.phone)}</Typography>
              <Typography>City: {formatValue(buyer.city)}</Typography>
              <Typography>Address: {formatValue(buyer.address)}</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Buyer Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography>Total Orders: {formatValue(buyer.totalOrders)}</Typography>
              <Typography>Total Spend: ₺{formatValue(buyer.totalSpend)}</Typography>
              <Typography>Status: {formatValue(buyer.status)}</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Raw Data
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(buyer, null, 2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default BuyerProfile
