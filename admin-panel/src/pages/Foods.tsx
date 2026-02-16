import { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Foods = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRows(await api.getFoods(500))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load foods')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <EntityTablePage
      title="Foods"
      rows={rows}
      loading={loading}
      error={error}
      preferredColumns={['id', 'name', 'cookId', 'cookName', 'category', 'price', 'isAvailable', 'rating', 'reviewCount']}
      trailing={<Button onClick={load}>Refresh</Button>}
    />
  )
}

export default Foods
