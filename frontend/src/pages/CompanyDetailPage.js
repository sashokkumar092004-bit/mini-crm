import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Grid, Chip, Table, TableHead, TableBody,
  TableRow, TableCell, CircularProgress, Alert, Button, Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import API from '../api/axios';

const STATUS_COLORS = { New: 'default', Contacted: 'primary', Qualified: 'success', Lost: 'error', Converted: 'warning' };

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => API.get(`/companies/${id}`).then((r) => r.data),
  });

  if (isLoading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.response?.data?.message || 'Failed to load company.'}</Alert>;

  const { company, leads } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/companies')} sx={{ mb: 2 }}>
        Back to Companies
      </Button>

      <Typography variant="h5" fontWeight={700} mb={3}>{company.name}</Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Company Details</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[
            ['Industry', company.industry],
            ['Location', company.location],
            ['Website', company.website],
            ['Phone', company.phone],
            ['Email', company.email],
          ].map(([label, val]) => val ? (
            <Grid item xs={12} sm={6} key={label}>
              <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
              <Typography variant="body1">{val}</Typography>
            </Grid>
          ) : null)}
          {company.description && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">Description</Typography>
              <Typography variant="body1">{company.description}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={2}>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600}>
            Associated Leads ({leads?.length || 0})
          </Typography>
        </Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Assigned To</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No leads associated with this company.
                </TableCell>
              </TableRow>
            ) : (
              leads?.map((lead) => (
                <TableRow key={lead._id} hover>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Chip label={lead.status} color={STATUS_COLORS[lead.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>{lead.assignedTo?.name || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
