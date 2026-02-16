import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
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
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    status: 'pending',
    userType: 'seller',
  })
  const { data: seller, isLoading: loading, error } = useQuery<UserRecord>({
    queryKey: ['seller', id],
    queryFn: () => api.getUser(String(id)),
    enabled: Boolean(id),
    staleTime: 15000,
  })
  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.updateSeller(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const isEditing = searchParams.get('edit') === '1'

  useEffect(() => {
    if (!seller) return
    setForm({
      displayName: String(seller.displayName || ''),
      email: String(seller.email || ''),
      phone: String(seller.phone || ''),
      status: String(seller.status || 'pending'),
      userType: String(seller.userType || 'seller'),
    })
  }, [seller])

  const onSave = async () => {
    await updateMutation.mutateAsync({
      displayName: form.displayName,
      email: form.email,
      phone: form.phone,
      status: form.status,
      userType: form.userType,
    })
    setSearchParams({})
  }

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
        {error && <Typography color="error.main">{error instanceof Error ? error.message : 'Failed to load seller'}</Typography>}
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
          {!isEditing && (
            <Button onClick={() => setSearchParams({ edit: '1' })}>
              Edit
            </Button>
          )}
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr' } }}>
        {isEditing && (
          <Box>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600}>
                Edit Seller
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label="Display Name"
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                />
                <TextField
                  size="small"
                  label="Email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <TextField
                  size="small"
                  label="Phone"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <FormControl size="small">
                  <InputLabel id="seller-status-label">Status</InputLabel>
                  <Select
                    labelId="seller-status-label"
                    label="Status"
                    value={form.status}
                    onChange={(event: SelectChangeEvent) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    <MenuItem value="enabled">enabled</MenuItem>
                    <MenuItem value="disabled">disabled</MenuItem>
                    <MenuItem value="pending">pending</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="seller-user-type-label">User Type</InputLabel>
                  <Select
                    labelId="seller-user-type-label"
                    label="User Type"
                    value={form.userType}
                    onChange={(event: SelectChangeEvent) => setForm((prev) => ({ ...prev, userType: event.target.value }))}
                  >
                    <MenuItem value="seller">seller</MenuItem>
                    <MenuItem value="both">both</MenuItem>
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={onSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={() => setSearchParams({})}>Cancel</Button>
                </Stack>
                {updateMutation.error && (
                  <Typography color="error.main">
                    {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to save'}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        )}
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
