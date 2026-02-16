import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, TextField } from '@mui/material'
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
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAuditLogs({
        limit: 500,
        entityType: entityType.trim() || undefined,
        entityId: entityId.trim() || undefined,
      })
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    load()
  }, [load])

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
      error={error}
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
          <Button onClick={load}>Apply</Button>
        </Box>
      }
    />
  )
}

export default AuditLogs
