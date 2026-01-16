import { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { departmentApi } from '../api/department';
import { roleApi } from '../api/role';
import type { User } from '../api/user';
import { useAuth } from '../hooks/useAuth';

export default function UsersPage() {
    const { can } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState<number | ''>('');
    const [departmentId, setDepartmentId] = useState<number | ''>('');

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
    });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentApi.getAll,
    });

    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
        enabled: can('read', 'role'), // Only fetch if we have permission (super-admin ideally)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => userApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: userApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const handleOpen = (user: User) => {
        setEditId(user.id);
        setUsername(user.username);
        setPassword(''); // Don't show password
        setRoleId(user.role?.id || user.roleId || '');
        setDepartmentId(user.department?.id || user.departmentId || '');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setUsername('');
        setPassword('');
        setRoleId('');
        setDepartmentId('');
    };

    const handleSubmit = () => {
        if (!editId) return;

        const payload: any = { username, roleId: Number(roleId), departmentId: Number(departmentId) };
        if (password) {
            payload.password = password;
        }

        updateMutation.mutate({ id: editId, data: payload });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteMutation.mutate(id);
        }
    };

    if (usersLoading) return <CircularProgress />;

    if (!can('read', 'user', 'any')) {
        return <Typography>You do not have permission to view users.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Users</Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role?.name}</TableCell>
                                <TableCell>{user.department?.name || '-'}</TableCell>
                                <TableCell align="right">
                                    {can('update', 'user', 'any') && (
                                        <Button color="primary" onClick={() => handleOpen(user)}>
                                            Edit
                                        </Button>
                                    )}
                                    {can('delete', 'user', 'any') && (
                                        <Button color="error" onClick={() => handleDelete(user.id)}>
                                            Delete
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="New Password (Optional)"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {can('update:sensitive', 'user') && (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={roleId}
                                    label="Role"
                                    onChange={(e) => setRoleId(e.target.value as number)}
                                >
                                    {roles?.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={departmentId}
                                    label="Department"
                                    onChange={(e) => setDepartmentId(e.target.value as number | '')}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {departments?.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
