import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteTicket } from '../../hooks/useTickets';
import type { TicketSummary } from '../../api/tickets';

export interface DeleteTicketDialogProps {
  open: boolean;
  ticket: TicketSummary | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteTicketDialog({
  open,
  ticket,
  onClose,
  onDeleted,
}: DeleteTicketDialogProps) {
  const { mutate: deleteTicket, isPending } = useDeleteTicket();

  const handleDelete = () => {
    if (!ticket) return;
    deleteTicket(ticket.id, {
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
      <DialogTitle>Delete Ticket</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{ticket?.ticketNumber}</strong> — {ticket?.subject}?
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
