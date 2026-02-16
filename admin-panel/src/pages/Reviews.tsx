import { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Reviews = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRows(await api.getReviews(500))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <EntityTablePage
      title="Reviews"
      rows={rows}
      loading={loading}
      error={error}
      preferredColumns={['id', 'foodId', 'userId', 'sellerId', 'rating', 'comment', 'createdAt']}
      trailing={<Button onClick={load}>Refresh</Button>}
    />
  )
}

export default Reviews
