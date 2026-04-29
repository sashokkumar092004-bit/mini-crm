import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, CircularProgress,
} from '@mui/material';
import API from '../api/axios';

const EMPTY = { name: '', industry: '', location: '', website: '', phone: '', email: '', description: '' };

export default function CompanyFormDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => API.post('/companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['companies-all']);
      setForm(EMPTY);
      setError('');
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create company.'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleClose = () => { setForm(EMPTY); setError(''); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Company</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Company Name" name="name" value={form.name} onChange={handleChange} required margin="normal" />
          <TextField fullWidth label="Industry" name="industry" value={form.industry} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Website" name="website" value={form.website} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} margin="normal" multiline rows={2} />
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
