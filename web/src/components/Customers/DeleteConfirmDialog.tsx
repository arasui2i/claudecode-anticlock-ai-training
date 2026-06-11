import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteCustomer } from '../../hooks/useCustomers';
import type { CustomerSummary } from '../../api/customers';

export interface DeleteConfirmDialogProps {
  open: boolean;
  customer: CustomerSummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteConfirmDialog({
  open,
  customer,
  onClose,
  onDeleted,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteCustomer, isPending } = useDeleteCustomer();

  const handleDelete = () => {
    if (!customer) return;
    deleteCustomer(customer.id, {
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
      <DialogTitle>Delete Customer</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete{' '}
          <strong>{customer?.firstName} {customer?.lastName}</strong>?
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
