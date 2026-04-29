import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Table, TableHead, TableBody, TableRow, TableCell, IconButton,
  Chip, Pagination, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import API from '../api/axios';

const STATUS_COLORS = {
  New: 'default', Contacted: 'primary', Qualified: 'success', Lost: 'error', Converted: 'warning',
};
const STATUSES = ['', 'New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

export default function LeadsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', page, search, status],
    queryFn: () =>
      API.get('/leads', { params: { page, limit: 10, search, status } }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setDeleteId(null);
    },
  });

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatus = (e) => { setStatus(e.target.value); setPage(1); };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Leads</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/leads/new')}>
          Add Lead
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Search" size="small" value={search} onChange={handleSearch}
            placeholder="Name or email..." sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={handleStatus}>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s || 'All'}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.response?.data?.message || 'Failed to load leads.'}</Alert>}

      <Paper elevation={2}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.leads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.leads?.map((lead) => (
                    <TableRow key={lead._id} hover>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={lead.status}
                          color={STATUS_COLORS[lead.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{lead.assignedTo?.name || '-'}</TableCell>
                      <TableCell>{lead.company?.name || '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/leads/${lead._id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(lead._id)}>
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

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Lead?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This lead will be soft-deleted and will no longer appear in the list. This action can be reversed by an admin via the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error" variant="contained"
            onClick={() => deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
