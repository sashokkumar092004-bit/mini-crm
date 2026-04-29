import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Button, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, Chip, Select, MenuItem, FormControl,
  InputLabel, Pagination, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Tooltip,
} from '@mui/material';
import { Add, CheckCircle, Delete } from '@mui/icons-material';
import API from '../api/axios';
import TaskFormDialog from '../components/TaskFormDialog';
import { useAuth } from '../contexts/AuthContext';
import { format } from '../utils/date';

const STATUS_COLORS = { Pending: 'warning', 'In Progress': 'primary', Completed: 'success' };
const STATUSES = ['', 'Pending', 'In Progress', 'Completed'];

export default function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', page, status],
    queryFn: () =>
      API.get('/tasks', { params: { page, limit: 10, status } }).then((r) => r.data),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => API.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/tasks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); setDeleteId(null); },
  });

  const canUpdateTask = (task) => {
    return user?.role === 'admin' || task.assignedTo?._id === user?._id;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Tasks</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
          Add Task
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s || 'All'}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.response?.data?.message || 'Failed to load tasks.'}</Alert>}

      <Paper elevation={2}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Lead</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.tasks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.tasks?.map((task) => (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary">{task.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{task.lead?.name || '-'}</TableCell>
                      <TableCell>{task.assignedTo?.name || '-'}</TableCell>
                      <TableCell>{task.dueDate ? format(task.dueDate) : '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={STATUS_COLORS[task.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {canUpdateTask(task) && task.status !== 'Completed' && (
                          <Tooltip title="Mark Complete">
                            <IconButton
                              size="small" color="success"
                              onClick={() => statusMutation.mutate({ id: task._id, status: 'Completed' })}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(task._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {data?.pages > 1 && (
              <Box display="flex" justifyContent="center" p={2}>
                <Pagination count={data.pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Paper>

      <TaskFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this task?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteMutation.mutate(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
