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
import { ContactStatus, type CreateContactPayload } from '../../api/contacts';
import { useContact, useCreateContact, useUpdateContact } from '../../hooks/useContacts';
import { useAccounts } from '../../hooks/useAccounts';

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountId: string;
  status: ContactStatus;
}

const DEFAULT_VALUES: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  accountId: '',
  status: ContactStatus.Active,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: contact, isLoading: contactLoading } = useContact(id ?? '');
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: accountsData } = useAccounts({ page: 1, pageSize: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (contact) {
      reset({
        firstName: contact.firstName,
        lastName:  contact.lastName ?? '',
        email:     contact.email,
        phone:     contact.phone ?? '',
        accountId: contact.accountId ?? '',
        status:    contact.status,
      });
    }
  }, [contact, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateContactPayload = {
      firstName: values.firstName,
      lastName:  values.lastName || null,
      email:     values.email,
      phone:     values.phone || null,
      accountId: values.accountId || null,
      status:    values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/contacts') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/contacts'),
      });
    }
  };

  if (isEdit && contactLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Contact' : 'New Contact'}
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
            name="accountId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="account-label">Account</InputLabel>
                <Select {...field} labelId="account-label" label="Account">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {accountsData?.items.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.accountName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select {...field} labelId="status-label" label="Status">
                  <MenuItem value={ContactStatus.Active}>Active</MenuItem>
                  <MenuItem value={ContactStatus.Inactive}>Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          />

        </Box>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/contacts')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Contact'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
