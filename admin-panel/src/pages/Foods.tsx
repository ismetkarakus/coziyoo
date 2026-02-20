import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@mui/material'
import { api } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const Foods = () => {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading: loading, error } = useQuery({
    queryKey: ['foods'],
    queryFn: () => api.getFoods({ limit: 500 }),
    staleTime: 15000,
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories({ activeOnly: true }),
    staleTime: 60000,
  })
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createFood(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.updateFood(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFood(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods'] }),
  })

  const handleCreate = async () => {
    const defaultCategory = categories[0]?.nameTr || 'Ana Yemek'
    const allowedCategories = categories.map((item) => item.nameTr)
    const raw = window.prompt(
      `New food JSON\nAllowed categories: ${allowedCategories.join(', ')}`,
      JSON.stringify({ name: '', cookId: '', price: 0, category: defaultCategory })
    )
    if (!raw) return
    const payload = JSON.parse(raw) as Record<string, unknown>
    const category = String(payload.category || '').trim()
    if (allowedCategories.length > 0 && !allowedCategories.includes(category)) {
      window.alert(`Invalid category. Use one of: ${allowedCategories.join(', ')}`)
      return
    }
    await createMutation.mutateAsync(payload)
  }

  const handleEdit = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    const allowedCategories = categories.map((item) => item.nameTr)
    const raw = window.prompt(
      `Edit food JSON\nAllowed categories: ${allowedCategories.join(', ')}`,
      JSON.stringify(row, null, 2)
    )
    if (!raw) return
    const payload = JSON.parse(raw) as Record<string, unknown>
    const category = String(payload.category || '').trim()
    if (category && allowedCategories.length > 0 && !allowedCategories.includes(category)) {
      window.alert(`Invalid category. Use one of: ${allowedCategories.join(', ')}`)
      return
    }
    await updateMutation.mutateAsync({ id, payload })
  }

  const handleDelete = async (row: Record<string, unknown>) => {
    const id = String(row.id || '')
    if (!id) return
    if (!window.confirm(`Delete food ${id}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <EntityTablePage
      title="Foods"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'name', 'cookId', 'cookName', 'category', 'price', 'isAvailable', 'rating', 'reviewCount']}
      trailing={
        <>
          <Button onClick={handleCreate}>Add</Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['foods'] })}>Refresh</Button>
        </>
      }
      onEditRow={handleEdit}
      onDeleteRow={handleDelete}
    />
  )
}

export default Foods
