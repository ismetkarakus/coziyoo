import { UsersTable } from './UsersTable'
import { Link } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

const Sellers = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Sellers
        </Typography>
        <Button component={Link} to="/sellers/new" variant="contained">
          Add Seller
        </Button>
      </Box>
      <UsersTable
        title=""
        filterType="seller"
        columns={[
          'displayName',
          'email',
          'phone',
          'status',
          'rating',
          'totalOrders',
          'verified',
          'sellerEnabled',
        ]}
      />
    </Box>
  )
}

export default Sellers
