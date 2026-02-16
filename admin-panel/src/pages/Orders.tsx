import { useCallback, useEffect, useState } from 'react'
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
import type { SelectChangeEvent } from '@mui/material'
import { api } from '../lib/api'
import type { OrderRecord } from '../lib/api'

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

const formatValue = (value: unknown) => (value == null || value === '' ? '—' : String(value))

const Orders = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getOrders({ limit: 500 })
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onStatusChange = async (id: string, event: SelectChangeEvent) => {
    const nextStatus = event.target.value
    setSaving((prev) => ({ ...prev, [id]: true }))
    try {
      await api.updateOrderStatus(id, nextStatus)
      setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Orders</Typography>
        <Button onClick={load}>Refresh</Button>
      </Box>

      {error && <Paper sx={{ p: 2, borderRadius: 3, color: 'error.main' }}>{error}</Paper>}

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
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
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
              </TableRow>
            ))}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No orders found.</TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Orders
