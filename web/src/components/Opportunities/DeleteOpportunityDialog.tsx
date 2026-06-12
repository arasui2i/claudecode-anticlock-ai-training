import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteOpportunity } from '../../hooks/useOpportunities';
import type { OpportunitySummary } from '../../api/opportunities';

export interface DeleteOpportunityDialogProps {
  open: boolean;
  opportunity: OpportunitySummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteOpportunityDialog({
  open,
  opportunity,
  onClose,
  onDeleted,
}: DeleteOpportunityDialogProps) {
  const { mutate: deleteOpportunity, isPending } = useDeleteOpportunity();

  const handleDelete = () => {
    if (!opportunity) return;
    deleteOpportunity(opportunity.id, {
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
      <DialogTitle>Delete Opportunity</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{opportunity?.opportunityName}</strong>?
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
