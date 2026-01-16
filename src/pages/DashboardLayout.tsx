import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    Button
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

export default function DashboardLayout() {
    const { logout, user, can } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Newsroom
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {can('read', 'news') && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/news" selected={location.pathname.startsWith('/news')}>
                            <ListItemText primary="News" />
                        </ListItemButton>
                    </ListItem>
                )}
                {can('read', 'department') && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/department" selected={location.pathname.startsWith('/department')}>
                            <ListItemText primary="Departments" />
                        </ListItemButton>
                    </ListItem>
                )}
                {can('read', 'user', 'any') && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/users" selected={location.pathname.startsWith('/users')}>
                            <ListItemText primary="Users" />
                        </ListItemButton>
                    </ListItem>
                )}
                {can('read', 'role') && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/roles" selected={location.pathname.startsWith('/roles')}>
                            <ListItemText primary="Roles" />
                        </ListItemButton>
                    </ListItem>
                )}
                {can('read', 'policy') && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/policy" selected={location.pathname.startsWith('/policy')}>
                            <ListItemText primary="Policy" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Logged in as: {user?.username}
                </Typography>
                <Button
                    component={Link}
                    to="/profile"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                >
                    My Profile
                </Button>
                <Button variant="contained" color="error" fullWidth onClick={logout}>
                    Logout
                </Button>
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        Menu
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
