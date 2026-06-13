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
import { ActivityType, ActivityStatus, type CreateActivityPayload } from '../../api/activities';
import { useActivity, useCreateActivity, useUpdateActivity } from '../../hooks/useActivities';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: ActivityType.Call,    label: 'Call' },
  { value: ActivityType.Email,   label: 'Email' },
  { value: ActivityType.Meeting, label: 'Meeting' },
  { value: ActivityType.Task,    label: 'Task' },
  { value: ActivityType.Note,    label: 'Note' },
];

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: ActivityStatus.Open,       label: 'Open' },
  { value: ActivityStatus.InProgress, label: 'In Progress' },
  { value: ActivityStatus.Completed,  label: 'Completed' },
  { value: ActivityStatus.Cancelled,  label: 'Cancelled' },
];

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

// ── Form value types ──────────────────────────────────────────────────────────

interface FormValues {
  subject: string;
  activityType: ActivityType;
  dueDate: string;
  status: ActivityStatus;
}

const DEFAULT_VALUES: FormValues = {
  subject:      '',
  activityType: ActivityType.Task,
  dueDate:      '',
  status:       ActivityStatus.Open,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: activity, isLoading: activityLoading } = useActivity(id ?? '');
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (activity) {
      reset({
        subject:      activity.subject,
        activityType: activity.activityType,
        dueDate:      toDateInputValue(activity.dueDate),
        status:       activity.status,
      });
    }
  }, [activity, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateActivityPayload = {
      subject:      values.subject,
      activityType: values.activityType,
      dueDate:      values.dueDate,
      status:       values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, payload },
        { onSuccess: () => navigate('/activities') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/activities'),
      });
    }
  };

  if (isEdit && activityLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {isEdit ? 'Edit Activity' : 'New Activity'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>

          <TextField
            label="Subject"
            required
            error={!!errors.subject}
            helperText={errors.subject?.message}
            sx={{ gridColumn: { sm: 'span 2' } }}
            {...register('subject', { required: 'Subject is required' })}
          />

          <Controller
            name="activityType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Select {...field} labelId="type-label" label="Type">
                  {TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <TextField
            label="Due Date"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.dueDate}
            helperText={errors.dueDate?.message}
            {...register('dueDate', { required: 'Due date is required' })}
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
            onClick={() => navigate('/activities')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isPending} sx={{ minWidth: 140 }}>
            {isPending
              ? <CircularProgress size={20} color="inherit" />
              : isEdit ? 'Save Changes' : 'Create Activity'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}
