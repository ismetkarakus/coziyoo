import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Media = () => {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading: loading, error } = useQuery({
    queryKey: ['media'],
    queryFn: () => api.getMedia({ limit: 500 }),
    staleTime: 15000,
  })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createMedia(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.updateMedia(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMedia(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  })

  const handleCreate = async () => {
    const raw = window.prompt(
      'New media JSON',
      JSON.stringify({ objectKey: `media/${Date.now()}`, contentType: 'image/jpeg', status: 'active' })
    )
    if (!raw) return
    await createMutation.mutateAsync(JSON.parse(raw) as Record<string, unknown>)
  }

  const handleEdit = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    const raw = window.prompt('Edit media JSON', JSON.stringify(row, null, 2))
    if (!raw) return
    await updateMutation.mutateAsync({ id, payload: JSON.parse(raw) as Record<string, unknown> })
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    if (!window.confirm(`Delete media ${id}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <EntityTablePage
      title="Media"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'provider', 'bucket', 'objectKey', 'publicUrl', 'ownerUserId', 'relatedEntityType', 'relatedEntityId', 'status', 'createdAt']}
      trailing={
        <>
          <Button onClick={handleCreate}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['media'] })}>Refresh</Button>
        </>
      }
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
    />
  )
}

export default Media
