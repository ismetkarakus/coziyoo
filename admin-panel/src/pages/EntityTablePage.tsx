import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

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

const normalizeValue = (value: unknown) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

interface EntityTablePageProps {
  title: string
  rows: Record<string, unknown>[]
  loading: boolean
  error: string | null
  preferredColumns?: string[]
  trailing?: ReactNode
  onEditRow?: (row: Record<string, unknown>) => void
  onDeleteRow?: (row: Record<string, unknown>) => void
  showActions?: boolean
}

export const EntityTablePage = ({
  title,
  rows,
  loading,
  error,
  preferredColumns,
  trailing,
  onEditRow,
  onDeleteRow,
  showActions = true,
}: EntityTablePageProps) => {
  const columns = useMemo(() => {
    if (preferredColumns && preferredColumns.length > 0) return preferredColumns
    const set = new Set<string>()
    rows.forEach((row) => Object.keys(row).forEach((key) => set.add(key)))
    return Array.from(set)
  }, [preferredColumns, rows])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>{title}</Typography>
        {trailing}
      </Box>
      {error && (
        <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>
          {error}
        </Paper>
      )}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 600 }}>{formatHeader(column)}</TableCell>
              ))}
              {showActions && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={String(row.id || row.uid || idx)}>
                {columns.map((column) => (
                  <TableCell key={column}>{normalizeValue(row[column])}</TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => onEditRow?.(row)} disabled={!onEditRow}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => onDeleteRow?.(row)} disabled={!onDeleteRow}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length + (showActions ? 1 : 0), 1)} align="center">No records found.</TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length + (showActions ? 1 : 0), 1)} align="center">Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
