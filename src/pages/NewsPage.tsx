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
import { newsApi } from '../api/news';
import { departmentApi } from '../api/department';
import type { News } from '../api/news';
import { useAuth } from '../hooks/useAuth';

export default function NewsPage() {
    const { can, user: canUser } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [departmentId, setDepartmentId] = useState<number | ''>('');

    const { data: newsList, isLoading: newsLoading } = useQuery({
        queryKey: ['news'],
        queryFn: newsApi.getAll,
    });

    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentApi.getAll,
        enabled: can('read', 'department'),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => newsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => newsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: newsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        },
    });

    const handleOpen = (item?: News) => {
        if (item) {
            setEditId(item.id);
            setTitle(item.title);
            setContents(item.contents);
            setDepartmentId(item.departmentId || '');
        } else {
            setEditId(null);
            setTitle('');
            setContents('');
            setDepartmentId('');
        }
        setOpen(true);
    };

    const handleView = (item: News) => {
        setSelectedNews(item);
        setViewOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setTitle('');
        setContents('');
        setDepartmentId('');
    };

    const handleViewClose = () => {
        setViewOpen(false);
        setSelectedNews(null);
    };

    const handleSubmit = () => {
        const payload: any = { title, contents };
        if (departmentId !== '') {
            payload.departmentId = Number(departmentId);
        }

        if (editId) {
            updateMutation.mutate({ id: editId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this article?')) {
            deleteMutation.mutate(id);
        }
    };

    if (newsLoading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">News Articles</Typography>
                {can('create', 'news') && (
                    <Button variant="contained" onClick={() => handleOpen()}>
                        Add Article
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Contents</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Writer ID</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {newsList?.map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>{item.id}</TableCell>
                                <TableCell
                                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => handleView(item)}
                                >
                                    {item.title}
                                </TableCell>
                                <TableCell>{item.contents.substring(0, 50)}...</TableCell>
                                <TableCell>{item.department?.name || item.departmentId}</TableCell>
                                <TableCell>{item.writerId}</TableCell>
                                <TableCell align="right">
                                    {/* 
                                      Show actions if:
                                      1. User has global/wide update access (Admin/SuperAdmin) - check 'any' ownership.
                                      2. OR User has general update access AND owns the item (Editor).
                                    */}
                                    {(can('update', 'news', 'any') || (can('update', 'news') && item.writerId === canUser?.sub)) && (
                                        <Button color="primary" onClick={() => handleOpen(item)}>
                                            Edit
                                        </Button>
                                    )}
                                    {(can('delete', 'news', 'any') || (can('delete', 'news') && item.writerId === canUser?.sub)) && (
                                        <Button color="error" onClick={() => handleDelete(item.id)}>
                                            Delete
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit Article' : 'Add Article'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    {/* Only show department selection if we have departments */}
                    {departments && departments.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={departmentId}
                                label="Department"
                                onChange={(e) => setDepartmentId(e.target.value as number | '')}
                            >
                                <MenuItem value="">
                                    <em>Default (Automatic)</em>
                                </MenuItem>
                                {departments?.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField
                        label="Contents"
                        multiline
                        rows={6}
                        fullWidth
                        variant="outlined"
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editId ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
                <DialogTitle>{selectedNews?.title}</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        By User {selectedNews?.writerId} | Department: {selectedNews?.department?.name || selectedNews?.departmentId || 'None'}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                        {selectedNews?.contents}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleViewClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
