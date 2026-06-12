import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteContact } from '../../hooks/useContacts';
import type { ContactSummary } from '../../api/contacts';

export interface DeleteContactDialogProps {
  open: boolean;
  contact: ContactSummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteContactDialog({
  open,
  contact,
  onClose,
  onDeleted,
}: DeleteContactDialogProps) {
  const { mutate: deleteContact, isPending } = useDeleteContact();

  const handleDelete = () => {
    if (!contact) return;
    deleteContact(contact.id, {
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
      <DialogTitle>Delete Contact</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{contact?.fullName}</strong>?
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
