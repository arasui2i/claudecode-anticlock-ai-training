import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useTickets } from '../../hooks/useTickets';
import { TicketPriority, TicketStatus, type TicketSummary } from '../../api/tickets';
import DeleteTicketDialog from '../../components/Tickets/DeleteTicketDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TicketPriority.Low]:      'Low',
  [TicketPriority.Medium]:   'Medium',
  [TicketPriority.High]:     'High',
  [TicketPriority.Critical]: 'Critical',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.Open]:       'Open',
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.Resolved]:   'Resolved',
  [TicketStatus.Closed]:     'Closed',
};

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 5;

export default function TicketListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<TicketSummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const { data, isLoading } = useTickets({
    search: debouncedSearch || undefined,
    page: page + 1,
    pageSize: PAGE_SIZE,
  });

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/tickets/new')}
        >
          Add Ticket
        </Button>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket Number</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: COL_COUNT }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COL_COUNT} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {debouncedSearch
                        ? 'No tickets match your search.'
                        : 'No tickets yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.ticketNumber}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{PRIORITY_LABELS[ticket.priority]}</TableCell>
                    <TableCell>{STATUS_LABELS[ticket.status]}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(ticket)}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      </Paper>

      <DeleteTicketDialog
        open={deleteTarget !== null}
        ticket={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
