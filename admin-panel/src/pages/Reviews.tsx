import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  return (
    <EntityTablePage
      title="Reviews"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'foodId', 'userId', 'sellerId', 'rating', 'comment', 'createdAt']}
      trailing={<Button onClick={() => queryClient.invalidateQueries({ queryKey: ['reviews'] })}>Refresh</Button>}
    />
  )
}

export default Reviews
