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
  rating?: number
  totalOrders?: number
  location?: string
  address?: string
  description?: string
  specialties?: string[]
  bankDetails?: Record<string, unknown>
  identityVerification?: Record<string, unknown>
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const SellerProfile = () => {
  const { id } = useParams()

  const seller = useMemo(() => {
    const allUsers = usersData as UserRecord[]
    return allUsers.find((user) => user.id === id) ?? null
  }, [id])

  if (!seller) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Seller not found
        </Typography>
        <Button component={Link} to="/sellers" sx={{ mt: 2 }}>
          Back to Sellers
        </Button>
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 84, height: 84 }}>
            {(seller.displayName ?? 'S').slice(0, 1)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {seller.displayName ?? '—'}
            </Typography>
            <Typography color="text.secondary">{seller.email ?? '—'}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={seller.userType ?? 'seller'} />
              <Chip label={seller.status ?? '—'} />
              <Chip label={`Rating: ${seller.rating ?? '—'}`} />
              <Chip label={`Orders: ${seller.totalOrders ?? '—'}`} />
            </Stack>
          </Box>
          <Button component={Link} to="/sellers">
            Back to Sellers
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
              <Typography>Email: {formatValue(seller.email)}</Typography>
              <Typography>Phone: {formatValue(seller.phone)}</Typography>
              <Typography>Location: {formatValue(seller.location)}</Typography>
              <Typography>Address: {formatValue(seller.address)}</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Seller Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography>Description: {formatValue(seller.description)}</Typography>
              <Typography>
                Specialties: {formatValue(seller.specialties)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Bank Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {formatValue(seller.bankDetails)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Identity Verification
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {formatValue(seller.identityVerification)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Raw Data
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(seller, null, 2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default SellerProfile
