import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert,
} from '@mui/material';
import API from '../api/axios';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

const EMPTY = { name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '', notes: '' };

export default function LeadFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: leadData, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => API.get(`/leads/${id}`).then((r) => r.data.lead),
    enabled: isEdit,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => API.get('/auth/users').then((r) => r.data.users),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-all'],
    queryFn: () => API.get('/companies', { params: { limit: 100 } }).then((r) => r.data.companies),
  });

  useEffect(() => {
    if (leadData) {
      setForm({
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        status: leadData.status || 'New',
        assignedTo: leadData.assignedTo?._id || '',
        company: leadData.company?._id || '',
        notes: leadData.notes || '',
      });
    }
  }, [leadData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? API.put(`/leads/${id}`, data) : API.post('/leads', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      navigate('/leads');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save lead.'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.company) delete payload.company;
    mutation.mutate(payload);
  };

  if (isEdit && leadLoading)
    return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isEdit ? 'Edit Lead' : 'Add New Lead'}
      </Typography>

      <Paper elevation={2} sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Name" name="name" value={form.name}
            onChange={handleChange} required margin="normal"
          />
          <TextField
            fullWidth label="Email" name="email" type="email" value={form.email}
            onChange={handleChange} required margin="normal"
          />
          <TextField
            fullWidth label="Phone" name="phone" value={form.phone}
            onChange={handleChange} margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} label="Status" onChange={handleChange}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned To</InputLabel>
            <Select name="assignedTo" value={form.assignedTo} label="Assigned To" onChange={handleChange}>
              <MenuItem value="">-- None --</MenuItem>
              {usersData?.map((u) => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Company</InputLabel>
            <Select name="company" value={form.company} label="Company" onChange={handleChange}>
              <MenuItem value="">-- None --</MenuItem>
              {companiesData?.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Notes" name="notes" value={form.notes}
            onChange={handleChange} margin="normal" multiline rows={3}
          />

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="submit" variant="contained"
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/leads')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
