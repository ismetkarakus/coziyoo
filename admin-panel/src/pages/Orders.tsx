import { useState } from 'react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { StatusToggle } from '../components/StatusToggle'

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

  const onStatusChange = async (id: string, nextStatus: 'enabled' | 'disabled') => {
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

  const onCreateOrder = async () => {
    const raw = window.prompt(
      'New order JSON',
      JSON.stringify({ buyerId: '', sellerId: '', status: 'pending', totalPrice: 0 })
    )
    if (!raw) return
    try {
      await api.createOrder(JSON.parse(raw) as Record<string, unknown>)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    } catch (_error) {
      // query error banner handles this state
    }
  }

  const onEditOrder = async (order: Record<string, unknown>) => {
    const id = String(order.id || '')
    if (!id) return
    const raw = window.prompt('Edit order JSON', JSON.stringify(order, null, 2))
    if (!raw) return
    try {
      await api.updateOrder(id, JSON.parse(raw) as Record<string, unknown>)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (_error) {
      // query error banner handles this state
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Orders</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onCreateOrder}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}>Refresh</Button>
        </Box>
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
                  <StatusToggle
                    value={String(order.status || '').toLowerCase() === 'disabled' || String(order.status || '').toLowerCase() === 'cancelled' ? 'disabled' : 'enabled'}
                    onChange={(next) => onStatusChange(order.id, next)}
                    disabled={Boolean(saving[order.id])}
                  />
                </TableCell>
                <TableCell>{formatValue(order.orderDate || order.createdAt)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onEditOrder(order as Record<string, unknown>)}>
                    Edit
                  </Button>
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
