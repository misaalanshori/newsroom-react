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
import { departmentApi } from '../api/department';
import type { Department } from '../api/department';
import { useAuth } from '../hooks/useAuth';

export default function DepartmentPage() {
    const { can } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: departmentApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string; slug: string } }) => departmentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: departmentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });

    const handleOpen = (dept?: Department) => {
        if (dept) {
            setEditId(dept.id);
            setName(dept.name);
            setSlug(dept.slug);
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
        if (confirm('Are you sure you want to delete this department?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        const generatedSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        setSlug(generatedSlug);
    };

    if (isLoading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Departments</Typography>
                {can('write', 'department') && (
                    <Button variant="contained" onClick={() => handleOpen()}>
                        Add Department
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
                        {departments?.map((dept) => (
                            <TableRow key={dept.id}>
                                <TableCell>{dept.id}</TableCell>
                                <TableCell>{dept.name}</TableCell>
                                <TableCell>{dept.slug}</TableCell>
                                <TableCell align="right">
                                    {can('write', 'department') && (
                                        <>
                                            <Button color="primary" onClick={() => handleOpen(dept)}>
                                                Edit
                                            </Button>
                                            <Button color="error" onClick={() => handleDelete(dept.id)}>
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editId ? 'Edit Department' : 'Add Department'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Department Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={handleNameChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Slug"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        helperText="Auto-generated from name"
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
