import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  DashboardOutlined,
  HelpOutlineOutlined,
  PeopleOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const SIDEBAR_WIDTH = 240;

const mainNav = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
  { label: 'Customers', icon: <PeopleOutlined />, path: '/customers' },
];

const secondaryNav = [
  { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
  { label: 'Help', icon: <HelpOutlineOutlined />, path: '/help' },
];

type NavItem = { label: string; icon: React.ReactNode; path: string };

function NavList({ items, isActive, onNavigate }: {
  items: NavItem[];
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
}) {
  return (
    <List disablePadding>
      {items.map(({ label, icon, path }) => (
        <ListItem key={path} disablePadding>
          <ListItemButton
            selected={isActive(path)}
            onClick={() => onNavigate(path)}
            sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          CRM
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, py: 1 }}>
        <NavList items={mainNav} isActive={isActive} onNavigate={navigate} />
      </Box>

      <Divider />

      <Box sx={{ py: 1 }}>
        <NavList items={secondaryNav} isActive={isActive} onNavigate={navigate} />
      </Box>
    </Drawer>
  );
}
