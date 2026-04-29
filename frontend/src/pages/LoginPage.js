import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Tab, Tabs, CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 0) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" color="primary" mb={1}>
          Mini CRM
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
          Manage your leads, companies, and tasks
        </Typography>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          {tab === 1 && (
            <TextField
              fullWidth label="Full Name" name="name" value={form.name}
              onChange={handleChange} required margin="normal" autoComplete="name"
            />
          )}
          <TextField
            fullWidth label="Email" name="email" type="email" value={form.email}
            onChange={handleChange} required margin="normal" autoComplete="email"
          />
          <TextField
            fullWidth label="Password" name="password" type="password" value={form.password}
            onChange={handleChange} required margin="normal" autoComplete="current-password"
            inputProps={{ minLength: 6 }}
          />
          <Button
            fullWidth type="submit" variant="contained" size="large"
            disabled={loading} sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? 'Login' : 'Register')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
