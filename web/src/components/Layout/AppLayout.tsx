import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
