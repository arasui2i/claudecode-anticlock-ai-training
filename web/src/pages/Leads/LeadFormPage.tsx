import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { LeadStatus, type CreateLeadPayload } from '../../api/leads';
import { useCreateLead, useLead, useUpdateLead } from '../../hooks/useLeads';

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  status: LeadStatus;
}

const DEFAULT_VALUES: FormValues = {
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  status: LeadStatus.New,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeadFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: lead, isLoading: leadLoading } = useLead(id ?? '');
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  // Pre-populate form in edit mode once lead data loads
  useEffect(() => {
    if (lead) {
      reset({
        firstName:   lead.firstName,
        lastName:    lead.lastName ?? '',
        companyName: lead.companyName,
        email:       lead.email,
        phone:       lead.phone ?? '',
        status:      lead.status,
      });
    }
  }, [lead, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateLeadPayload = {
      firstName:   values.firstName,
      lastName:    values.lastName || null,
      companyName: values.companyName,
      email:       values.email,
      phone:       values.phone || null,
      status:      values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/leads') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/leads'),
      });
    }
  };

  if (isEdit && leadLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Lead' : 'New Lead'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>

          <TextField
            label="First Name"
            required
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />

          <TextField
            label="Last Name"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName')}
          />

          <TextField
            label="Company"
            required
            error={!!errors.companyName}
            helperText={errors.companyName?.message}
            {...register('companyName', { required: 'Company name is required' })}
          />

          <TextField
            label="Email"
            required
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />

          <TextField
            label="Phone"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            {...register('phone')}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select {...field} labelId="status-label" label="Status">
                  <MenuItem value={LeadStatus.New}>New</MenuItem>
                  <MenuItem value={LeadStatus.Contacted}>Contacted</MenuItem>
                  <MenuItem value={LeadStatus.Qualified}>Qualified</MenuItem>
                  <MenuItem value={LeadStatus.Unqualified}>Unqualified</MenuItem>
                  <MenuItem value={LeadStatus.Converted}>Converted</MenuItem>
                </Select>
              </FormControl>
            )}
          />

        </Box>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/leads')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
