import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteLead } from '../../hooks/useLeads';
import type { LeadSummary } from '../../api/leads';

export interface DeleteLeadDialogProps {
  open: boolean;
  lead: LeadSummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteLeadDialog({
  open,
  lead,
  onClose,
  onDeleted,
}: DeleteLeadDialogProps) {
  const { mutate: deleteLead, isPending } = useDeleteLead();

  const handleDelete = () => {
    if (!lead) return;
    deleteLead(lead.id, {
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
      <DialogTitle>Delete Lead</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{lead?.fullName}</strong>?
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
