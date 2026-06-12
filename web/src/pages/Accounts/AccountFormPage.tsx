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
import { AccountStatus, type CreateAccountPayload } from '../../api/accounts';
import { useAccount, useCreateAccount, useUpdateAccount } from '../../hooks/useAccounts';

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  accountName: string;
  industry: string;
  website: string;
  phone: string;
  status: AccountStatus;
}

const DEFAULT_VALUES: FormValues = {
  accountName: '',
  industry: '',
  website: '',
  phone: '',
  status: AccountStatus.Active,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AccountFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: account, isLoading: accountLoading } = useAccount(id ?? '');
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (account) {
      reset({
        accountName: account.accountName,
        industry:    account.industry ?? '',
        website:     account.website ?? '',
        phone:       account.phone ?? '',
        status:      account.status,
      });
    }
  }, [account, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateAccountPayload = {
      accountName: values.accountName,
      industry:    values.industry || null,
      website:     values.website || null,
      phone:       values.phone || null,
      status:      values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/accounts') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/accounts'),
      });
    }
  };

  if (isEdit && accountLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Account' : 'New Account'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>

          <TextField
            label="Account Name"
            required
            error={!!errors.accountName}
            helperText={errors.accountName?.message}
            sx={{ gridColumn: { sm: 'span 2' } }}
            {...register('accountName', { required: 'Account name is required' })}
          />

          <TextField
            label="Industry"
            error={!!errors.industry}
            helperText={errors.industry?.message}
            {...register('industry')}
          />

          <TextField
            label="Website"
            error={!!errors.website}
            helperText={errors.website?.message}
            {...register('website')}
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
                  <MenuItem value={AccountStatus.Active}>Active</MenuItem>
                  <MenuItem value={AccountStatus.Inactive}>Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          />

        </Box>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/accounts')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
