import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { api } from '../lib/api'
import { StatusToggle } from '../components/StatusToggle'

const Reviews = () => {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading: loading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.getReviews({ limit: 500 }),
    staleTime: 15000,
  })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createReview(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.updateReview(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })

  const handleCreate = async () => {
    const raw = window.prompt('New review JSON', JSON.stringify({ foodId: '', rating: 5, comment: '' }))
    if (!raw) return
    await createMutation.mutateAsync(JSON.parse(raw) as Record<string, unknown>)
  }

  const handleEdit = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    const raw = window.prompt('Edit review JSON', JSON.stringify(row, null, 2))
    if (!raw) return
    await updateMutation.mutateAsync({ id, payload: JSON.parse(raw) as Record<string, unknown> })
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    if (!window.confirm(`Delete review ${id}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  const handleStatusChange = async (row: Record<string, unknown>, nextStatus: 'enabled' | 'disabled') => {
    const id = String(row.id || '')
    if (!id) return
    await updateMutation.mutateAsync({
      id,
      payload: {
        ...row,
        status: nextStatus,
      },
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Reviews</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleCreate}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['reviews'] })}>Refresh</Button>
        </Box>
      </Box>

      {error && <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>{error instanceof Error ? error.message : 'Failed to load reviews'}</Paper>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Food</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={String(row.id || idx)}>
                <TableCell>{String(row.id || '—')}</TableCell>
                <TableCell>{String(row.foodId || '—')}</TableCell>
                <TableCell>{String(row.userId || '—')}</TableCell>
                <TableCell>{String(row.sellerId || '—')}</TableCell>
                <TableCell>{String(row.rating ?? '—')}</TableCell>
                <TableCell>{String(row.comment || '—')}</TableCell>
                <TableCell>
                  <StatusToggle
                    value={String(row.status || 'enabled').toLowerCase() === 'disabled' ? 'disabled' : 'enabled'}
                    onChange={(next) => handleStatusChange(row, next)}
                  />
                </TableCell>
                <TableCell>{String(row.createdAt || '—')}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(row)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">No reviews found.</TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Reviews
