import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    TextField,
    CircularProgress,
    Container
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
    const { user: authUser } = useAuth(); // getting authUser from context mainly for ID
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // We can fetch fresh user data or just use authUser if it has enough info.
    // Better to fetch fresh to get current DB state (username might have changed elsewhere?)
    // Actually useAuth user is from token. Token is immutable until refresh.
    // But update endpoint updates DB. 
    // Let's populate from authUser for now, or fetch /user/me again? 
    // /user/me is already in useAuth... but wait, useAuth only decodes token.
    // useAuth fetches /user/me ONLY for permissions.
    // So let's fetch /user/me here to display current profile data.

    // Actually we can just load the data into state on mount

    useEffect(() => {
        if (authUser) {
            setUsername(authUser.username);
        }
    }, [authUser]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => userApi.update(authUser!.sub, data),
        onSuccess: () => {
            setMessage('Profile updated successfully');
            setPassword('');
            // Note: Token is not updated, so Sidebar name won't change until relogin 
            // unless we force a token refresh or update context manually.
        },
        onError: () => {
            setMessage('Failed to update profile');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const payload: any = { username };
        if (password) {
            payload.password = password;
        }
        updateMutation.mutate(payload);
    };

    if (!authUser) return <CircularProgress />;

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>My Profile</Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="New Password (Optional)"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Role: {authUser.role}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Department ID: {authUser.departmentId}
                        </Typography>
                    </Box>

                    {message && (
                        <Typography color={message.includes('success') ? 'primary' : 'error'} sx={{ mt: 2 }}>
                            {message}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={updateMutation.isPending}
                    >
                        Update Profile
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
