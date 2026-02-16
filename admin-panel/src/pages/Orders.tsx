import { useState } from 'react'
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SelectChangeEvent } from '@mui/material'
import { api } from '../lib/api'

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

const formatValue = (value: unknown) => (value == null || value === '' ? '—' : String(value))

const Orders = () => {
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()
  const { data = [], isLoading: loading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders({ limit: 500 }),
    staleTime: 15000,
  })
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const onStatusChange = async (id: string, event: SelectChangeEvent) => {
    const nextStatus = event.target.value
    setSaving((prev) => ({ ...prev, [id]: true }))
    try {
      await mutation.mutateAsync({ id, status: nextStatus })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (err) {
      // query error banner handles this state
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }))
    }
  }

  const onDeleteOrder = async (id: string) => {
    const ok = window.confirm(`Delete order ${id}?`)
    if (!ok) return
    try {
      await api.deleteOrder(id)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    } catch (_error) {
      // query error banner handles this state
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Orders</Typography>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>Refresh</Button>
      </Box>

      {error && <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>{error instanceof Error ? error.message : 'Failed to load orders'}</Paper>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{formatValue(order.buyerName || order.buyerId)}</TableCell>
                <TableCell>{formatValue(order.cookName || order.sellerId)}</TableCell>
                <TableCell>{formatValue(order.totalPrice)}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={String(order.status || 'pending')}
                    onChange={(event) => onStatusChange(order.id, event)}
                    disabled={Boolean(saving[order.id])}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{formatValue(order.orderDate || order.createdAt)}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => onDeleteOrder(order.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No orders found.</TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Orders
