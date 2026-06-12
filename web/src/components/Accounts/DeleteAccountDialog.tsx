import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteAccount } from '../../hooks/useAccounts';
import type { AccountSummary } from '../../api/accounts';

export interface DeleteAccountDialogProps {
  open: boolean;
  account: AccountSummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteAccountDialog({
  open,
  account,
  onClose,
  onDeleted,
}: DeleteAccountDialogProps) {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const handleDelete = () => {
    if (!account) return;
    deleteAccount(account.id, {
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
      <DialogTitle>Delete Account</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{account?.accountName}</strong>?
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
