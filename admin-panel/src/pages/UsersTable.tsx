import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Switch,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { UserRecord } from '../lib/api'
import { StatusToggle } from '../components/StatusToggle'

const normalizeValue = (value: unknown) => {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const formatHeader = (value: string) => {
  const withSpaces = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
  return withSpaces
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const resolveRowId = (row: UserRecord) => String(row.uid || row.id || '')

interface UsersTableProps {
  title: string
  filterType: 'buyer' | 'seller'
  columns?: string[]
}

export const UsersTable = ({ title, filterType, columns: forcedColumns }: UsersTableProps) => {
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const detailBase = filterType === 'seller' ? '/sellers' : '/buyers'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: rows = [], isLoading: loading, error } = useQuery<UserRecord[]>({
    queryKey: ['users', filterType, search],
    queryFn: () => api.getUsers({ role: filterType, q: search, limit: 500 }),
    staleTime: 15000,
  })

  const columns = useMemo(() => {
    if (forcedColumns && forcedColumns.length > 0) {
      const preferredFirst = ['status', 'verified']
      const rest = forcedColumns.filter((column) => !preferredFirst.includes(column))
      return [
        ...preferredFirst.filter((column) => forcedColumns.includes(column)),
        ...rest,
      ]
    }
    const keys = new Set<string>()
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key))
    })
    const collected = Array.from(keys)
    const preferredFirst = ['status', 'verified']
    const rest = collected.filter((column) => !preferredFirst.includes(column))
    return [
      ...preferredFirst.filter((column) => collected.includes(column)),
      ...rest,
    ]
  }, [forcedColumns, rows])

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      filterType === 'seller' ? api.updateSeller(id, payload) : api.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      filterType === 'seller' ? api.deleteSeller(id) : api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const handleEdit = (event: MouseEvent, row: UserRecord) => {
    event.stopPropagation()
    const id = resolveRowId(row)
    if (!id) return
    navigate(`${detailBase}/${id}?edit=1`)
  }

  const handleDelete = async (event: MouseEvent, row: UserRecord) => {
    event.stopPropagation()
    const id = resolveRowId(row)
    if (!id) return
    const ok = window.confirm(`Delete user ${id}?`)
    if (!ok) return

    setActionError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const handleStatusChange = async (status: 'enabled' | 'disabled' | 'pending', row: UserRecord) => {
    const id = resolveRowId(row)
    if (!id) return

    setActionError(null)
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status },
      })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to change status')
    }
  }

  const handleVerifiedChange = async (verified: boolean, row: UserRecord) => {
    const id = resolveRowId(row)
    if (!id) return

    setActionError(null)
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { verified },
      })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to change verification')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title ? (
          <Typography variant="h4" fontWeight={600}>
            {title}
          </Typography>
        ) : (
          <span />
        )}
        <TextField
          size="small"
          placeholder="Search by name, email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Box>

      {error && (
        <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>
          {error instanceof Error ? error.message : 'Failed to load users'}
        </Paper>
      )}
      {actionError && (
        <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>
          {actionError}
        </Paper>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}
      >
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 600 }}>
                  {formatHeader(column)}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const rowId = resolveRowId(row)
              return (
                <TableRow
                  key={rowId}
                  hover
                  sx={{ cursor: rowId ? 'pointer' : 'default' }}
                  onClick={() => rowId && navigate(`${detailBase}/${rowId}`)}
                >
                  {columns.map((column) => {
                    if (column === 'status') {
                      return (
                        <TableCell key={column}>
                          <Box onClick={(event) => event.stopPropagation()}>
                            <StatusToggle
                              value={String(row.status || 'enabled').toLowerCase() === 'enabled' ? 'enabled' : 'disabled'}
                              onChange={(next) => handleStatusChange(next, row)}
                            />
                          </Box>
                        </TableCell>
                      )
                    }
                    if (column === 'verified') {
                      const checked = row.verified === true || String(row.verified).toLowerCase() === 'true'
                      return (
                        <TableCell key={column}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(event) => event.stopPropagation()}>
                            <Switch
                              size="small"
                              checked={checked}
                              onChange={(_event, nextChecked) => handleVerifiedChange(nextChecked, row)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#2e7d32',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#2e7d32',
                                  opacity: 1,
                                },
                                '& .MuiSwitch-switchBase': {
                                  color: '#d32f2f',
                                },
                                '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                                  backgroundColor: '#d32f2f',
                                  opacity: 1,
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                      )
                    }
                    const value = row[column]
                    return (
                      <TableCell key={column}>{normalizeValue(value)}</TableCell>
                    )
                  })}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={(event) => handleEdit(event, row)}>Edit</Button>
                      <Button size="small" color="error" onClick={(event) => handleDelete(event, row)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length + 1, 1)} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length + 1, 1)} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
