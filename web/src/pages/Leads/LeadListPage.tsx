import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
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
import { useLeads } from '../../hooks/useLeads';
import { LeadStatus, type LeadSummary } from '../../api/leads';
import DeleteLeadDialog from '../../components/Leads/DeleteLeadDialog';

// ── Status display helpers ────────────────────────────────────────────────────

const STATUS_LABEL: Record<LeadStatus, string> = {
  [LeadStatus.New]:         'New',
  [LeadStatus.Contacted]:   'Contacted',
  [LeadStatus.Qualified]:   'Qualified',
  [LeadStatus.Unqualified]: 'Unqualified',
  [LeadStatus.Converted]:   'Converted',
};

type ChipColor = 'default' | 'info' | 'success' | 'warning' | 'primary';

const STATUS_COLOR: Record<LeadStatus, ChipColor> = {
  [LeadStatus.New]:         'default',
  [LeadStatus.Contacted]:   'info',
  [LeadStatus.Qualified]:   'success',
  [LeadStatus.Unqualified]: 'warning',
  [LeadStatus.Converted]:   'primary',
};

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 5;

export default function LeadListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0); // 0-based for MUI; API is 1-based

  const [deleteTarget, setDeleteTarget] = useState<LeadSummary | null>(null);

  // Debounce search — 300 ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const { data, isLoading } = useLeads({
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
          placeholder="Search leads…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/leads/new')}
        >
          Add Lead
        </Button>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Email</TableCell>
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
                        ? 'No leads match your search.'
                        : 'No leads yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell>{lead.fullName}</TableCell>
                    <TableCell>{lead.companyName}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[lead.status]}
                        color={STATUS_COLOR[lead.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/leads/${lead.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(lead)}
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

      <DeleteLeadDialog
        open={deleteTarget !== null}
        lead={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
