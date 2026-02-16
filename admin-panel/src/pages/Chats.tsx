import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createChat(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.updateChat(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteChat(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })

  const handleCreate = async () => {
    const raw = window.prompt('New chat JSON', JSON.stringify({ buyerId: '', sellerId: '', isActive: true }))
    if (!raw) return
    await createMutation.mutateAsync(JSON.parse(raw) as Record<string, unknown>)
  }

  const handleEdit = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    const raw = window.prompt('Edit chat JSON', JSON.stringify(row, null, 2))
    if (!raw) return
    await updateMutation.mutateAsync({ id, payload: JSON.parse(raw) as Record<string, unknown> })
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    if (!window.confirm(`Delete chat ${id}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <EntityTablePage
      title="Chats"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'buyerId', 'sellerId', 'isActive', 'lastMessage', 'lastMessageTime', 'lastMessageSender']}
      trailing={
        <>
          <Button onClick={handleCreate}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['chats'] })}>Refresh</Button>
        </>
      }
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
    />
  )
}

export default Chats
