import { useState } from 'react';
import { AppBar, Avatar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { AuthUser } from '../../api/auth';

function usePageTitle(): string {
  const { pathname } = useLocation();
  if (/\/customers\/[^/]+\/edit/.test(pathname)) return 'Edit Customer';
  if (/\/customers\/new/.test(pathname)) return 'New Customer';
  if (/\/customers\/[^/]+/.test(pathname)) return 'Customer Detail';
  if (pathname.startsWith('/customers')) return 'Customers';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help';
  return 'Dashboard';
}

function initials(user: AuthUser | null): string {
  if (!user) return '?';
  const name = user.username || user.email;
  return name.slice(0, 2).toUpperCase();
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const title = usePageTitle();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
            {initials(user)}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
