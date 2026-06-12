import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { OpportunityStage, type CreateOpportunityPayload } from '../../api/opportunities';
import { useOpportunity, useCreateOpportunity, useUpdateOpportunity } from '../../hooks/useOpportunities';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAGE_OPTIONS: { value: OpportunityStage; label: string }[] = [
  { value: OpportunityStage.Prospecting,   label: 'Prospecting' },
  { value: OpportunityStage.Qualification, label: 'Qualification' },
  { value: OpportunityStage.Proposal,      label: 'Proposal' },
  { value: OpportunityStage.Negotiation,   label: 'Negotiation' },
  { value: OpportunityStage.ClosedWon,     label: 'Closed Won' },
  { value: OpportunityStage.ClosedLost,    label: 'Closed Lost' },
];

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  opportunityName: string;
  accountId: string;
  contactId: string;
  stage: OpportunityStage;
  expectedRevenue: string;
  closeDate: string;
}

const DEFAULT_VALUES: FormValues = {
  opportunityName: '',
  accountId:       '',
  contactId:       '',
  stage:           OpportunityStage.Prospecting,
  expectedRevenue: '',
  closeDate:       '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function OpportunityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: opportunity, isLoading: opportunityLoading } = useOpportunity(id ?? '');
  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: accountsData } = useAccounts({ page: 1, pageSize: 100 });
  const { data: contactsData } = useContacts({ page: 1, pageSize: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (opportunity) {
      reset({
        opportunityName: opportunity.opportunityName,
        accountId:       opportunity.accountId,
        contactId:       opportunity.contactId ?? '',
        stage:           opportunity.stage,
        expectedRevenue: opportunity.expectedRevenue != null
          ? String(opportunity.expectedRevenue)
          : '',
        closeDate:       toDateInputValue(opportunity.closeDate),
      });
    }
  }, [opportunity, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateOpportunityPayload = {
      opportunityName: values.opportunityName,
      accountId:       values.accountId,
      contactId:       values.contactId || null,
      stage:           values.stage,
      expectedRevenue: values.expectedRevenue ? Number(values.expectedRevenue) : null,
      closeDate:       values.closeDate || null,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/opportunities') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/opportunities'),
      });
    }
  };

  if (isEdit && opportunityLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>

          <TextField
            label="Opportunity Name"
            required
            error={!!errors.opportunityName}
            helperText={errors.opportunityName?.message}
            sx={{ gridColumn: { sm: 'span 2' } }}
            {...register('opportunityName', { required: 'Opportunity name is required' })}
          />

          <Controller
            name="accountId"
            control={control}
            rules={{ required: 'Account is required' }}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.accountId}>
                <InputLabel id="account-label">Account</InputLabel>
                <Select {...field} labelId="account-label" label="Account">
                  {accountsData?.items.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.accountName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.accountId && (
                  <FormHelperText>{errors.accountId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="contactId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="contact-label">Contact</InputLabel>
                <Select {...field} labelId="contact-label" label="Contact">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {contactsData?.items.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="stage"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="stage-label">Stage</InputLabel>
                <Select {...field} labelId="stage-label" label="Stage">
                  {STAGE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <TextField
            label="Expected Revenue"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            error={!!errors.expectedRevenue}
            helperText={errors.expectedRevenue?.message}
            {...register('expectedRevenue')}
          />

          <TextField
            label="Close Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.closeDate}
            helperText={errors.closeDate?.message}
            {...register('closeDate')}
          />

        </Box>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/opportunities')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 160 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Opportunity'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
