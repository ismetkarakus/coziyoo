import { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Media = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRows(await api.getMedia(500))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <EntityTablePage
      title="Media"
      rows={rows}
      loading={loading}
      error={error}
      preferredColumns={['id', 'provider', 'bucket', 'objectKey', 'publicUrl', 'ownerUserId', 'relatedEntityType', 'relatedEntityId', 'status', 'createdAt']}
      trailing={<Button onClick={load}>Refresh</Button>}
    />
  )
}

export default Media
