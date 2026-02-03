import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usersData from '../../mock/users.json'
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

type UserRecord = Record<string, unknown> & {
  id: string
  userType?: string
  displayName?: string
  email?: string
  status?: string
}

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

interface UsersTableProps {
  title: string
  filterType: 'buyer' | 'seller'
  columns?: string[]
}

export const UsersTable = ({ title, filterType, columns: forcedColumns }: UsersTableProps) => {
  const [search, setSearch] = useState('')
  const detailBase = filterType === 'seller' ? '/sellers' : '/buyers'
  const navigate = useNavigate()

  const rows = useMemo<UserRecord[]>(() => {
    const base = (usersData as UserRecord[]).filter((user) => {
      if (filterType === 'buyer') return user.userType === 'buyer' || user.userType === 'both'
      return user.userType === 'seller' || user.userType === 'both'
    })

    if (!search.trim()) return base
    const term = search.toLowerCase()

    return base.filter((user) =>
      [user.id, user.displayName, user.email, user.status, user.userType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
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
          placeholder="Search by name, email, status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Box>
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
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`${detailBase}/${row.id}`)}
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
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
