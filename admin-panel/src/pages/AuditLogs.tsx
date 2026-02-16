import { useMemo, useState } from 'react'
import { Box, Button, TextField } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { AuditLogRecord } from '../lib/api'
import { EntityTablePage } from './EntityTablePage'

const compactJson = (value: unknown) => {
  if (value == null) return '—'
  try {
    const text = JSON.stringify(value)
    return text.length > 180 ? `${text.slice(0, 180)}...` : text
  } catch (_error) {
    return String(value)
  }
}

const AuditLogs = () => {
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const queryClient = useQueryClient()
  const { data: logs = [], isLoading: loading, error } = useQuery<AuditLogRecord[]>({
    queryKey: ['audit-logs', entityType, entityId],
    queryFn: () => api.getAuditLogs({
      limit: 500,
      entityType: entityType.trim() || undefined,
      entityId: entityId.trim() || undefined,
    }),
    staleTime: 15000,
  })

  const rows = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        createdAt: log.createdAt,
        actorEmail: log.actorEmail,
        actorRole: log.actorRole,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId || '—',
        before: compactJson(log.before),
        after: compactJson(log.after),
      })),
    [logs]
  )

  return (
    <EntityTablePage
      title="Audit Logs"
      rows={rows}
      loading={loading}
      error={error instanceof Error ? error.message : null}
      preferredColumns={['createdAt', 'actorEmail', 'actorRole', 'action', 'entityType', 'entityId', 'before', 'after', 'id']}
      trailing={
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Entity Type"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          />
          <TextField
            size="small"
            label="Entity ID"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['audit-logs'] })}>Apply</Button>
        </Box>
      }
    />
  )
}

export default AuditLogs
