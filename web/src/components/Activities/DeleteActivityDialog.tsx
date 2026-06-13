import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteActivity } from '../../hooks/useActivities';
import type { ActivitySummary } from '../../api/activities';

export interface DeleteActivityDialogProps {
  open: boolean;
  activity: ActivitySummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteActivityDialog({
  open,
  activity,
  onClose,
  onDeleted,
}: DeleteActivityDialogProps) {
  const { mutate: deleteActivity, isPending } = useDeleteActivity();

  const handleDelete = () => {
    if (!activity) return;
    deleteActivity(activity.id, {
      onSuccess: () => {
        onDeleted?.();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete Activity</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{activity?.subject}</strong>?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button color="error" onClick={handleDelete} disabled={isPending}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
