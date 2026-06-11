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
import { useCustomers } from '../../hooks/useCustomers';
import { useAuth } from '../../context/AuthContext';
import { CustomerStatus, type CustomerSummary } from '../../api/customers';
import DeleteConfirmDialog from '../../components/Customers/DeleteConfirmDialog';

// ── Status display helpers ────────────────────────────────────────────────────

const STATUS_LABEL: Record<CustomerStatus, string> = {
  [CustomerStatus.Lead]:     'Lead',
  [CustomerStatus.Prospect]: 'Prospect',
  [CustomerStatus.Active]:   'Active',
  [CustomerStatus.Inactive]: 'Inactive',
};

type ChipColor = 'default' | 'info' | 'success' | 'warning';

const STATUS_COLOR: Record<CustomerStatus, ChipColor> = {
  [CustomerStatus.Lead]:     'default',
  [CustomerStatus.Prospect]: 'info',
  [CustomerStatus.Active]:   'success',
  [CustomerStatus.Inactive]: 'warning',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 7;

export default function CustomerListPage() {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes('Admin');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0); // 0-based for MUI; API is 1-based

  const [deleteTarget, setDeleteTarget] = useState<CustomerSummary | null>(null);

  // Debounce search — 300 ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0); // reset to first page immediately on new search
  };

  const { data, isLoading } = useCustomers({
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
          placeholder="Search customers…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/customers/new')}
        >
          Add Customer
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
                <TableCell>Job Title</TableCell>
                <TableCell>Created At</TableCell>
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
                        ? 'No customers match your search.'
                        : 'No customers yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                    <TableCell>{customer.company ?? '—'}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[customer.status]}
                        color={STATUS_COLOR[customer.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.jobTitle ?? '—'}</TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/customers/${customer.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      {isAdmin && (
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="delete"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      )}
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

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        customer={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
