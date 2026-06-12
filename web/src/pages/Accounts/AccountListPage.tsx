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
import { useAccounts } from '../../hooks/useAccounts';
import type { AccountSummary } from '../../api/accounts';
import DeleteAccountDialog from '../../components/Accounts/DeleteAccountDialog';

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 4;

export default function AccountListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<AccountSummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const { data, isLoading } = useAccounts({
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
          placeholder="Search accounts…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/accounts/new')}
        >
          Add Account
        </Button>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Phone</TableCell>
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
                        ? 'No accounts match your search.'
                        : 'No accounts yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell>{account.industry ?? '—'}</TableCell>
                    <TableCell>{account.phone ?? '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/accounts/${account.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(account)}
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

      <DeleteAccountDialog
        open={deleteTarget !== null}
        account={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
