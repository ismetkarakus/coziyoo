import { UsersTable } from './UsersTable'
import { Box, Typography } from '@mui/material'

const Buyers = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" fontWeight={600}>
        Buyers
      </Typography>
      <UsersTable
        title=""
        filterType="buyer"
        columns={[
          'displayName',
          'email',
          'phone',
          'status',
          'rating',
          'verified',
        ]}
      />
    </Box>
  )
}

export default Buyers
