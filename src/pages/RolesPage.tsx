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
    CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../api/role';
import type { Role } from '../api/role';
import { useAuth } from '../hooks/useAuth';

export default function RolesPage() {
    const { can } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: roleApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string } }) => roleApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: roleApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });

    const handleOpen = (role?: Role) => {
        if (role) {
            setEditId(role.id);
            setName(role.name);
            setSlug(role.slug);
        } else {
            setEditId(null);
            setName('');
            setSlug('');
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setName('');
        setSlug('');
    };

    const handleSubmit = () => {
        if (editId) {
            updateMutation.mutate({ id: editId, data: { name, slug } });
        } else {
            createMutation.mutate({ name, slug });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!editId) {
            const generatedSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            setSlug(generatedSlug);
        }
    };

    if (isLoading) return <CircularProgress />;

    if (!can('read', 'role')) {
        return <Typography>You do not have permission to view roles.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Roles</Typography>
                {can('create', 'role') && (
                    <Button variant="contained" onClick={() => handleOpen()}>
                        Add Role
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Slug</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles?.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>{role.id}</TableCell>
                                <TableCell>{role.name}</TableCell>
                                <TableCell>{role.slug}</TableCell>
                                <TableCell align="right">
                                    {can('update', 'role') && (
                                        <Button color="primary" onClick={() => handleOpen(role)}>
                                            Edit
                                        </Button>
                                    )}
                                    {can('delete', 'role') && (
                                        <Button color="error" onClick={() => handleDelete(role.id)}>
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
                <DialogTitle>{editId ? 'Edit Role' : 'Add Role'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Role Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={handleNameChange}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Slug"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        helperText="Auto-generated from name (for new roles)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editId ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
