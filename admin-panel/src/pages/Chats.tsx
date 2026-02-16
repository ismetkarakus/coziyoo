import { useCallback, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Chats = () => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setRows(await api.getChats(500))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <EntityTablePage
      title="Chats"
      rows={rows}
      loading={loading}
      error={error}
      preferredColumns={['id', 'buyerId', 'sellerId', 'isActive', 'lastMessage', 'lastMessageTime', 'lastMessageSender']}
      trailing={<Button onClick={load}>Refresh</Button>}
    />
  )
}

export default Chats
