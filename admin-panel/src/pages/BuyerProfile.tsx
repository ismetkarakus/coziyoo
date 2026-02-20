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

const BuyerProfile = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [form, setForm] = useState({
    fullName: '',
    displayName: '',
    birthDate: '',
    gender: '',
    email: '',
    phone: '',
    status: 'enabled',
    userType: 'buyer',
  })
  const { data: buyer, isLoading: loading, error } = useQuery<UserRecord>({
    queryKey: ['buyer', id],
    queryFn: () => api.getUser(String(id)),
    enabled: Boolean(id),
    staleTime: 15000,
  })
  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.updateUser(String(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  const isEditing = searchParams.get('edit') === '1'

  useEffect(() => {
    if (!buyer) return
    setForm({
      fullName: String(buyer.fullName || ''),
      displayName: String(buyer.displayName || ''),
      birthDate: String(buyer.birthDate || ''),
      gender: String(buyer.gender || ''),
      email: String(buyer.email || ''),
      phone: String(buyer.phone || (buyer as any).phoneNumber || ''),
      status: String(buyer.status || 'enabled'),
      userType: String(buyer.userType || 'buyer'),
    })
  }, [buyer])

  const onSave = async () => {
    await updateMutation.mutateAsync({
      fullName: form.fullName,
      displayName: form.displayName,
      birthDate: form.birthDate,
      gender: form.gender,
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
        <Typography>Loading buyer...</Typography>
      </Paper>
    )
  }

  if (!buyer || error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Buyer not found
        </Typography>
        {error && <Typography color="error.main">{error instanceof Error ? error.message : 'Failed to load buyer'}</Typography>}
        <Button component={Link} to="/buyers" sx={{ mt: 2 }}>
          Back to Buyers
        </Button>
      </Paper>
    )
  }

  const displayName = String(buyer.displayName || buyer.email || 'Buyer')

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
            <Typography color="text.secondary">{String(buyer.email || '—')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={String(buyer.userType || 'buyer')} />
              <Chip label={String(buyer.status || '—')} />
              <Chip label={`UID: ${String(buyer.uid || buyer.id || '—')}`} />
            </Stack>
          </Box>
          <Button component={Link} to="/buyers">
            Back to Buyers
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
                Edit Buyer
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label="Full Name"
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
                <TextField
                  size="small"
                  label="Display Name"
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                />
                <TextField
                  size="small"
                  label="Date of Birth"
                  value={form.birthDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                />
                <TextField
                  size="small"
                  label="Gender"
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
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
                  <InputLabel id="buyer-status-label">Status</InputLabel>
                  <Select
                    labelId="buyer-status-label"
                    label="Status"
                    value={form.status}
                    onChange={(event: SelectChangeEvent) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    <MenuItem value="enabled">enabled</MenuItem>
                    <MenuItem value="disabled">disabled</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="buyer-user-type-label">User Type</InputLabel>
                  <Select
                    labelId="buyer-user-type-label"
                    label="User Type"
                    value={form.userType}
                    onChange={(event: SelectChangeEvent) => setForm((prev) => ({ ...prev, userType: event.target.value }))}
                  >
                    <MenuItem value="buyer">buyer</MenuItem>
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
              <Typography>Full Name: {formatValue(buyer.fullName)}</Typography>
              <Typography>Display Name: {formatValue(buyer.displayName)}</Typography>
              <Typography>Date of Birth: {formatValue(buyer.birthDate)}</Typography>
              <Typography>Gender: {formatValue(buyer.gender)}</Typography>
              <Typography>Email: {formatValue(buyer.email)}</Typography>
              <Typography>Phone: {formatValue(buyer.phone || (buyer as any).phoneNumber)}</Typography>
              <Typography>Status: {formatValue(buyer.status)}</Typography>
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
              {JSON.stringify(buyer, null, 2)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Stack>
  )
}

export default BuyerProfile
