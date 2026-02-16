import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  return (
    <EntityTablePage
      title="Media"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['id', 'provider', 'bucket', 'objectKey', 'publicUrl', 'ownerUserId', 'relatedEntityType', 'relatedEntityId', 'status', 'createdAt']}
      trailing={<Button onClick={() => queryClient.invalidateQueries({ queryKey: ['media'] })}>Refresh</Button>}
    />
  )
}

export default Media
