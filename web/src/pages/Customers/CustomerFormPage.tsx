import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CustomerStatus, Gender, type CreateCustomerPayload } from '../../api/customers';
import { useCreateCustomer, useCustomer, useUpdateCustomer } from '../../hooks/useCustomers';

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
  industry: string;
  headquartersAddress: string;
  status: CustomerStatus;
  gender: Gender | '';
  age: string;
  annualIncome: string;
  employeeCount: string;
}

const DEFAULT_VALUES: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phoneNumber: '',
  industry: '',
  headquartersAddress: '',
  status: CustomerStatus.Lead,
  gender: '',
  age: '',
  annualIncome: '',
  employeeCount: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: customer, isLoading: customerLoading } = useCustomer(id ?? '');
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  // Pre-populate form in edit mode once the customer data loads
  useEffect(() => {
    if (customer) {
      reset({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        company: customer.company ?? '',
        jobTitle: customer.jobTitle ?? '',
        phoneNumber: customer.phoneNumber ?? '',
        industry: customer.industry ?? '',
        headquartersAddress: customer.headquartersAddress ?? '',
        status: customer.status,
        gender: customer.gender ?? '',
        age: customer.age?.toString() ?? '',
        annualIncome: customer.annualIncome?.toString() ?? '',
        employeeCount: customer.employeeCount?.toString() ?? '',
      });
    }
  }, [customer, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateCustomerPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      company: values.company || null,
      jobTitle: values.jobTitle || null,
      phoneNumber: values.phoneNumber || null,
      industry: values.industry || null,
      headquartersAddress: values.headquartersAddress || null,
      status: values.status,
      gender: values.gender !== '' ? (values.gender as Gender) : null,
      age: values.age ? parseInt(values.age, 10) : null,
      annualIncome: values.annualIncome ? parseFloat(values.annualIncome) : null,
      employeeCount: values.employeeCount ? parseInt(values.employeeCount, 10) : null,
    };

    const handle409 = (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('email', { message: 'Email already in use' });
      }
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/customers'), onError: handle409 },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/customers'),
        onError: handle409,
      });
    }
  };

  if (isEdit && customerLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Customer' : 'New Customer'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── Basic Info ──────────────────────────────────────────────────── */}
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Basic Info
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          <TextField
            label="First Name"
            required
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <TextField
            label="Last Name"
            required
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName', { required: 'Last name is required' })}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select {...field} labelId="status-label" label="Status">
                  <MenuItem value={CustomerStatus.Lead}>Lead</MenuItem>
                  <MenuItem value={CustomerStatus.Prospect}>Prospect</MenuItem>
                  <MenuItem value={CustomerStatus.Active}>Active</MenuItem>
                  <MenuItem value={CustomerStatus.Inactive}>Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <TextField
            label="Job Title"
            {...register('jobTitle')}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Contact
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
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
            label="Phone Number"
            {...register('phoneNumber')}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select {...field} labelId="gender-label" label="Gender">
                  <MenuItem value=""><em>Not specified</em></MenuItem>
                  <MenuItem value={Gender.Male}>Male</MenuItem>
                  <MenuItem value={Gender.Female}>Female</MenuItem>
                  <MenuItem value={Gender.Other}>Other</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <TextField
            label="Age"
            type="number"
            {...register('age')}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ── Company ────────────────────────────────────────────────────── */}
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Company
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
          <TextField
            label="Company"
            {...register('company')}
          />
          <TextField
            label="Industry"
            {...register('industry')}
          />
          <TextField
            label="Annual Income"
            type="number"
            {...register('annualIncome')}
          />
          <TextField
            label="Employee Count"
            type="number"
            {...register('employeeCount')}
          />
          <TextField
            label="Headquarters Address"
            sx={{ gridColumn: { sm: '1 / -1' } }}
            {...register('headquartersAddress')}
          />
        </Box>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/customers')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
