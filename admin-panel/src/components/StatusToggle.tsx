import { Box, Switch } from '@mui/material'

interface StatusToggleProps {
  value: 'enabled' | 'disabled'
  disabled?: boolean
  onChange: (next: 'enabled' | 'disabled') => void
}

export const StatusToggle = ({ value, disabled, onChange }: StatusToggleProps) => {
  const checked = value === 'enabled'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        size="small"
        disabled={disabled}
        checked={checked}
        onChange={(_event, nextChecked) => onChange(nextChecked ? 'enabled' : 'disabled')}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#2e7d32',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#2e7d32',
            opacity: 1,
          },
          '& .MuiSwitch-switchBase': {
            color: '#d32f2f',
          },
          '& .MuiSwitch-switchBase + .MuiSwitch-track': {
            backgroundColor: '#d32f2f',
            opacity: 1,
          },
        }}
      />
    </Box>
  )
}
