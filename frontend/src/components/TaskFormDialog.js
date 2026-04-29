import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import API from '../api/axios';

const EMPTY = { title: '', description: '', lead: '', assignedTo: '', dueDate: '', status: 'Pending' };
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function TaskFormDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => API.get('/auth/users').then((r) => r.data.users),
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => API.get('/leads', { params: { limit: 200 } }).then((r) => r.data.leads),
  });

  const mutation = useMutation({
    mutationFn: (data) => API.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['dashboard']);
      setForm(EMPTY);
      setError('');
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create task.'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleClose = () => { setForm(EMPTY); setError(''); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.dueDate) delete payload.dueDate;
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Task</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} margin="normal" multiline rows={2} />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Lead</InputLabel>
            <Select name="lead" value={form.lead} label="Lead" onChange={handleChange}>
              <MenuItem value="">-- Select Lead --</MenuItem>
              {leadsData?.map((l) => <MenuItem key={l._id} value={l._id}>{l.name} ({l.email})</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Assign To</InputLabel>
            <Select name="assignedTo" value={form.assignedTo} label="Assign To" onChange={handleChange}>
              <MenuItem value="">-- Select User --</MenuItem>
              {usersData?.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} margin="normal" InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} label="Status" onChange={handleChange}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
