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
import { useActivities } from '../../hooks/useActivities';
import { ActivityType, ActivityStatus, type ActivitySummary } from '../../api/activities';
import DeleteActivityDialog from '../../components/Activities/DeleteActivityDialog';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ActivityType, string> = {
  [ActivityType.Call]:    'Call',
  [ActivityType.Email]:   'Email',
  [ActivityType.Meeting]: 'Meeting',
  [ActivityType.Task]:    'Task',
  [ActivityType.Note]:    'Note',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.Open]:       'Open',
  [ActivityStatus.InProgress]: 'In Progress',
  [ActivityStatus.Completed]:  'Completed',
  [ActivityStatus.Cancelled]:  'Cancelled',
};

function formatDueDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_ROWS = PAGE_SIZE;
const COL_COUNT = 5;

export default function ActivityListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<ActivitySummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const { data, isLoading } = useActivities({
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
          placeholder="Search activities…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/activities/new')}
        >
          Add Activity
        </Button>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Due Date</TableCell>
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
                        ? 'No activities match your search.'
                        : 'No activities yet. Add one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>{activity.subject}</TableCell>
                    <TableCell>{TYPE_LABELS[activity.activityType]}</TableCell>
                    <TableCell>{formatDueDate(activity.dueDate)}</TableCell>
                    <TableCell>{STATUS_LABELS[activity.status]}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => navigate(`/activities/${activity.id}/edit`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(activity)}
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

      <DeleteActivityDialog
        open={deleteTarget !== null}
        activity={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
