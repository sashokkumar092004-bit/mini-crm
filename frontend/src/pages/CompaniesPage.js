import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Button, TextField, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, Pagination, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Tooltip,
} from '@mui/material';
import { Add, Visibility, Delete } from '@mui/icons-material';
import API from '../api/axios';
import CompanyFormDialog from '../components/CompanyFormDialog';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', page, search],
    queryFn: () =>
      API.get('/companies', { params: { page, limit: 10, search } }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/companies/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['companies']); setDeleteId(null); },
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Companies</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
          Add Company
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Search" size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Name, industry, or location..." sx={{ minWidth: 260 }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.response?.data?.message || 'Failed to load companies.'}</Alert>}

      <Paper elevation={2}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Company Name</strong></TableCell>
                  <TableCell><strong>Industry</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.companies?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.companies?.map((company) => (
                    <TableRow key={company._id} hover>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry || '-'}</TableCell>
                      <TableCell>{company.location || '-'}</TableCell>
                      <TableCell>{company.email || '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/companies/${company._id}`)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(company._id)}>
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

      <CompanyFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Company?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this company?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteMutation.mutate(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
