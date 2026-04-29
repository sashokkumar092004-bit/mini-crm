import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { People, Star, Assignment, CheckCircle } from '@mui/icons-material';
import API from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box
      sx={{
        width: 56, height: 56, borderRadius: 2, bgcolor: `${color}.light`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 28 } })}
    </Box>
    <Box>
      <Typography variant="h4" fontWeight={700}>{value ?? '-'}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => API.get('/dashboard/stats').then((r) => r.data),
  });

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return <Alert severity="error">{error.response?.data?.message || 'Failed to load dashboard data.'}</Alert>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Leads" value={data?.totalLeads} icon={<People />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Qualified Leads" value={data?.qualifiedLeads} icon={<Star />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasks Due Today" value={data?.tasksDueToday} icon={<Assignment />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Tasks" value={data?.completedTasks} icon={<CheckCircle />} color="info" />
        </Grid>
      </Grid>

      {data?.leadsByStatus?.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Leads by Status</Typography>
          <Grid container spacing={2}>
            {data.leadsByStatus.map((item) => (
              <Grid item key={item._id}>
                <Box sx={{ textAlign: 'center', px: 2, py: 1, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={700}>{item.count}</Typography>
                  <Typography variant="caption" color="text.secondary">{item._id}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
