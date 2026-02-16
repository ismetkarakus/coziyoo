import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { api } from '../lib/api'
import type { UserRecord } from '../lib/api'

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
  const [rows, setRows] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const detailBase = filterType === 'seller' ? '/sellers' : '/buyers'
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const users = await api.getUsers({ role: filterType, q: search, limit: 500 })
        if (!cancelled) setRows(users)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(run, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filterType, search])

  const columns = useMemo(() => {
    if (forcedColumns && forcedColumns.length > 0) return forcedColumns
    const keys = new Set<string>()
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key))
    })
    return Array.from(keys)
  }, [forcedColumns, rows])

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
          {error}
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
                    const value = row[column]
                    if (column === 'status') {
                      return (
                        <TableCell key={column}>
                          <Chip label={normalizeValue(value)} size="small" />
                        </TableCell>
                      )
                    }
                    return (
                      <TableCell key={column}>{normalizeValue(value)}</TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length, 1)} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length, 1)} align="center">
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
