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
import { useOpportunities } from '../../hooks/useOpportunities';
import { OpportunityStage, type OpportunitySummary } from '../../api/opportunities';
import DeleteOpportunityDialog from '../../components/Opportunities/DeleteOpportunityDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<OpportunityStage, string> = {
  [OpportunityStage.Prospecting]:   'Prospecting',
  [OpportunityStage.Qualification]: 'Qualification',
  [OpportunityStage.Proposal]:      'Proposal',
  [OpportunityStage.Negotiation]:   'Negotiation',
  [OpportunityStage.ClosedWon]:     'Closed Won',
  [OpportunityStage.ClosedLost]:    'Closed Lost',
};

function formatRevenue(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 5;

export default function OpportunityListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<OpportunitySummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const { data, isLoading } = useOpportunities({
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
          placeholder="Search opportunities…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/opportunities/new')}
        >
          Add Opportunity
        </Button>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Opportunity</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Revenue</TableCell>
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
                        ? 'No opportunities match your search.'
                        : 'No opportunities yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((opportunity) => (
                  <TableRow key={opportunity.id} hover>
                    <TableCell>{opportunity.opportunityName}</TableCell>
                    <TableCell>{opportunity.accountName}</TableCell>
                    <TableCell>{STAGE_LABELS[opportunity.stage]}</TableCell>
                    <TableCell>{formatRevenue(opportunity.expectedRevenue)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/opportunities/${opportunity.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(opportunity)}
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

      <DeleteOpportunityDialog
        open={deleteTarget !== null}
        opportunity={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
