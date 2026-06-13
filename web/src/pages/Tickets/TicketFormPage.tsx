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
import { TicketPriority, TicketStatus, type CreateTicketPayload } from '../../api/tickets';
import { useTicket, useCreateTicket, useUpdateTicket } from '../../hooks/useTickets';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: TicketPriority.Low,      label: 'Low' },
  { value: TicketPriority.Medium,   label: 'Medium' },
  { value: TicketPriority.High,     label: 'High' },
  { value: TicketPriority.Critical, label: 'Critical' },
];

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.Open,       label: 'Open' },
  { value: TicketStatus.InProgress, label: 'In Progress' },
  { value: TicketStatus.Resolved,   label: 'Resolved' },
  { value: TicketStatus.Closed,     label: 'Closed' },
];

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  subject: string;
  accountId: string;
  contactId: string;
  priority: TicketPriority;
  status: TicketStatus;
}

const DEFAULT_VALUES: FormValues = {
  subject:   '',
  accountId: '',
  contactId: '',
  priority:  TicketPriority.Medium,
  status:    TicketStatus.Open,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TicketFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: ticket, isLoading: ticketLoading } = useTicket(id ?? '');
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
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
    if (ticket) {
      reset({
        subject:   ticket.subject,
        accountId: ticket.accountId ?? '',
        contactId: ticket.contactId ?? '',
        priority:  ticket.priority,
        status:    ticket.status,
      });
    }
  }, [ticket, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateTicketPayload = {
      subject:   values.subject,
      accountId: values.accountId || null,
      contactId: values.contactId || null,
      priority:  values.priority,
      status:    values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/tickets') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/tickets'),
      });
    }
  };

  if (isEdit && ticketLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Ticket' : 'New Ticket'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>

          {isEdit && ticket && (
            <TextField
              label="Ticket Number"
              value={ticket.ticketNumber}
              InputProps={{ readOnly: true }}
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
          )}

          <TextField
            label="Subject"
            required
            error={!!errors.subject}
            helperText={errors.subject?.message}
            sx={{ gridColumn: { sm: 'span 2' } }}
            {...register('subject', { required: 'Subject is required' })}
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
            name="priority"
            control={control}
            rules={{ required: 'Priority is required' }}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.priority}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select {...field} labelId="priority-label" label="Priority">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.priority && (
                  <FormHelperText>{errors.priority.message}</FormHelperText>
                )}
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
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

        </Box>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/tickets')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Ticket'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
