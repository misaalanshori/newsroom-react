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
    Tabs,
    Tab,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policyApi } from '../api/policy';
import { roleApi } from '../api/role';
import type { CreatePolicyDto } from '../api/policy';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

// Available resources and actions for policy creation
const RESOURCES = ['news', 'department', 'user', 'role', 'policy'];
const SCOPES = ['global', 'department'];
const OWNERSHIPS = ['any', 'own'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'update:sensitive'];

export default function PolicyPage() {
    const { can } = useAuth();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Dialog state for creating policies
    const [openPolicy, setOpenPolicy] = useState(false);
    const [openHierarchy, setOpenHierarchy] = useState(false);

    // Policy form state
    const [policyV0, setPolicyV0] = useState('');
    const [policyV1, setPolicyV1] = useState('');
    const [policyV2, setPolicyV2] = useState('global');
    const [policyV3, setPolicyV3] = useState('any');
    const [policyV4, setPolicyV4] = useState('read');

    // Hierarchy form state
    const [childRole, setChildRole] = useState('');
    const [parentRole, setParentRole] = useState('');

    // Fetch all policies
    const { data: allPolicies, isLoading: policiesLoading } = useQuery({
        queryKey: ['policies'],
        queryFn: () => policyApi.getAll(),
    });

    // Fetch roles for dropdowns
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.getAll,
    });

    // Filter by ptype
    const hierarchyRules = allPolicies?.filter(p => p.ptype === 'g') || [];
    const permissionRules = allPolicies?.filter(p => p.ptype === 'p') || [];

    const createMutation = useMutation({
        mutationFn: (dto: CreatePolicyDto) => policyApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            handleClosePolicy();
            handleCloseHierarchy();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: policyApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
        },
    });

    const reloadMutation = useMutation({
        mutationFn: policyApi.reload,
    });

    const handleClosePolicy = () => {
        setOpenPolicy(false);
        setPolicyV0('');
        setPolicyV1('');
        setPolicyV2('global');
        setPolicyV3('any');
        setPolicyV4('read');
    };

    const handleCloseHierarchy = () => {
        setOpenHierarchy(false);
        setChildRole('');
        setParentRole('');
    };

    const handleCreatePolicy = () => {
        createMutation.mutate({
            ptype: 'p',
            v0: policyV0,
            v1: policyV1,
            v2: policyV2,
            v3: policyV3,
            v4: policyV4,
        });
    };

    const handleCreateHierarchy = () => {
        createMutation.mutate({
            ptype: 'g',
            v0: childRole,
            v1: parentRole,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleReload = () => {
        reloadMutation.mutate();
    };

    if (policiesLoading) return <CircularProgress />;

    if (!can('read', 'policy')) {
        return <Typography>You do not have permission to view policies.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Policy Management</Typography>
                <Button
                    onClick={handleReload}
                    disabled={reloadMutation.isPending}
                >
                    ↻ Reload Policies
                </Button>
            </Box>

            <Paper sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                    <Tab label="Role Hierarchy (g)" />
                    <Tab label="Permissions (p)" />
                </Tabs>
            </Paper>

            {/* Tab 0: Role Hierarchy */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Role Inheritance</Typography>
                    {can('create', 'policy') && (
                        <Button variant="contained" onClick={() => setOpenHierarchy(true)}>
                            Add Hierarchy
                        </Button>
                    )}
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Child Role (v0)</TableCell>
                                <TableCell>→</TableCell>
                                <TableCell>Parent Role (v1)</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hierarchyRules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.id}</TableCell>
                                    <TableCell><Chip label={rule.v0} size="small" color="primary" /></TableCell>
                                    <TableCell>inherits from</TableCell>
                                    <TableCell><Chip label={rule.v1} size="small" color="secondary" /></TableCell>
                                    <TableCell align="right">
                                        {can('delete', 'policy') && (
                                            <Button size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                                Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Tab 1: Permissions */}
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Permission Policies</Typography>
                    {can('create', 'policy') && (
                        <Button variant="contained" onClick={() => setOpenPolicy(true)}>
                            Add Permission
                        </Button>
                    )}
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Role/User (v0)</TableCell>
                                <TableCell>Resource (v1)</TableCell>
                                <TableCell>Scope (v2)</TableCell>
                                <TableCell>Ownership (v3)</TableCell>
                                <TableCell>Action (v4)</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {permissionRules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.id}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={rule.v0}
                                            size="small"
                                            color={rule.v0?.startsWith('user:') ? 'warning' : 'primary'}
                                        />
                                    </TableCell>
                                    <TableCell>{rule.v1}</TableCell>
                                    <TableCell>{rule.v2}</TableCell>
                                    <TableCell>{rule.v3}</TableCell>
                                    <TableCell>
                                        <Chip label={rule.v4} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                        {can('delete', 'policy') && (
                                            <Button size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                                Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Dialog: Add Permission */}
            <Dialog open={openPolicy} onClose={handleClosePolicy} maxWidth="sm" fullWidth>
                <DialogTitle>Add Permission Rule</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Role or User (e.g. editor, user:5)"
                        fullWidth
                        variant="outlined"
                        value={policyV0}
                        onChange={(e) => setPolicyV0(e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                        helperText="Enter role slug or user:ID for user-specific permission"
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Resource</InputLabel>
                        <Select value={policyV1} label="Resource" onChange={(e) => setPolicyV1(e.target.value)}>
                            {RESOURCES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Scope</InputLabel>
                        <Select value={policyV2} label="Scope" onChange={(e) => setPolicyV2(e.target.value)}>
                            {SCOPES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Ownership</InputLabel>
                        <Select value={policyV3} label="Ownership" onChange={(e) => setPolicyV3(e.target.value)}>
                            {OWNERSHIPS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Action</InputLabel>
                        <Select value={policyV4} label="Action" onChange={(e) => setPolicyV4(e.target.value)}>
                            {ACTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePolicy}>Cancel</Button>
                    <Button onClick={handleCreatePolicy} variant="contained" disabled={!policyV0 || !policyV1}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Add Hierarchy */}
            <Dialog open={openHierarchy} onClose={handleCloseHierarchy}>
                <DialogTitle>Add Role Hierarchy</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Child role inherits all permissions from parent role.
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Child Role</InputLabel>
                        <Select value={childRole} label="Child Role" onChange={(e) => setChildRole(e.target.value)}>
                            {roles?.map(r => <MenuItem key={r.id} value={r.slug}>{r.name} ({r.slug})</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Parent Role</InputLabel>
                        <Select value={parentRole} label="Parent Role" onChange={(e) => setParentRole(e.target.value)}>
                            {roles?.map(r => <MenuItem key={r.id} value={r.slug}>{r.name} ({r.slug})</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHierarchy}>Cancel</Button>
                    <Button onClick={handleCreateHierarchy} variant="contained" disabled={!childRole || !parentRole}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
