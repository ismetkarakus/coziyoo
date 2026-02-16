import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Chats = () => {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading: loading, error } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.getChats({ limit: 500 }),
    staleTime: 15000,
  })

  return (
    <EntityTablePage
      title="Chats"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'buyerId', 'sellerId', 'isActive', 'lastMessage', 'lastMessageTime', 'lastMessageSender']}
      trailing={<Button onClick={() => queryClient.invalidateQueries({ queryKey: ['chats'] })}>Refresh</Button>}
    />
  )
}

export default Chats
