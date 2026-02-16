import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Reviews = () => {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading: loading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.getReviews({ limit: 500 }),
    staleTime: 15000,
  })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createReview(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.updateReview(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })

  const handleCreate = async () => {
    const raw = window.prompt('New review JSON', JSON.stringify({ foodId: '', rating: 5, comment: '' }))
    if (!raw) return
    await createMutation.mutateAsync(JSON.parse(raw) as Record<string, unknown>)
  }

  const handleEdit = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    const raw = window.prompt('Edit review JSON', JSON.stringify(row, null, 2))
    if (!raw) return
    await updateMutation.mutateAsync({ id, payload: JSON.parse(raw) as Record<string, unknown> })
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    if (!window.confirm(`Delete review ${id}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <EntityTablePage
      title="Reviews"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'foodId', 'userId', 'sellerId', 'rating', 'comment', 'createdAt']}
      trailing={
        <>
          <Button onClick={handleCreate}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['reviews'] })}>Refresh</Button>
        </>
      }
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
    />
  )
}

export default Reviews
