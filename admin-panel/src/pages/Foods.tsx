import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  return (
    <EntityTablePage
      title="Foods"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'name', 'cookId', 'cookName', 'category', 'price', 'isAvailable', 'rating', 'reviewCount']}
      trailing={<Button onClick={() => queryClient.invalidateQueries({ queryKey: ['foods'] })}>Refresh</Button>}
    />
  )
}

export default Foods
