import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import { ArrowBackOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useCustomer } from '../../hooks/useCustomers';
import { useAuth } from '../../context/AuthContext';
import { CustomerStatus, Gender } from '../../api/customers';
import DeleteConfirmDialog from '../../components/Customers/DeleteConfirmDialog';

// ── Display helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<CustomerStatus, string> = {
  [CustomerStatus.Lead]:     'Lead',
  [CustomerStatus.Prospect]: 'Prospect',
  [CustomerStatus.Active]:   'Active',
  [CustomerStatus.Inactive]: 'Inactive',
};

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.Male]:   'Male',
  [Gender.Female]: 'Female',
  [Gender.Other]:  'Other',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
      {children}
    </Typography>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
      {children}
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Card variant="outlined" sx={{ maxWidth: 800 }}>
      <CardHeader
        title={<Skeleton width={200} />}
        subheader={<Skeleton width={120} />}
        action={<Box sx={{ display: 'flex', gap: 1, pt: 1, pr: 1 }}><Skeleton variant="rounded" width={80} height={36} /><Skeleton variant="rounded" width={80} height={36} /></Box>}
      />
      <Divider />
      <CardContent>
        {Array.from({ length: 3 }).map((_, s) => (
          <Box key={s} mb={s < 2 ? 0 : undefined}>
            <Skeleton width={80} height={20} sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton width={60} height={16} />
                  <Skeleton width={120} height={20} />
                </Box>
              ))}
            </Box>
            {s < 2 && <Divider sx={{ mb: 3 }} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes('Admin');

  const { data: customer, isLoading, isError } = useCustomer(id!);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      {/* Back link */}
      <Button
        component={Link}
        to="/customers"
        startIcon={<ArrowBackOutlined />}
        sx={{ mb: 2 }}
      >
        Back to Customers
      </Button>

      {isLoading && <LoadingSkeleton />}

      {isError && (
        <Typography color="error">Customer not found or could not be loaded.</Typography>
      )}

      {customer && (
        <Card variant="outlined" sx={{ maxWidth: 800 }}>
          <CardHeader
            title={
              <Typography variant="h6" fontWeight={600}>
                {customer.firstName} {customer.lastName}
              </Typography>
            }
            subheader={customer.company ?? undefined}
            action={
              <Box sx={{ display: 'flex', gap: 1, pt: 1, pr: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`/customers/${id}/edit`)}
                >
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlined />}
                    onClick={() => setDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            }
          />

          <Divider />

          <CardContent>
            {/* Basic Info */}
            <SectionLabel>Basic Info</SectionLabel>
            <FieldGrid>
              <DetailField label="First Name" value={customer.firstName} />
              <DetailField label="Last Name"  value={customer.lastName} />
              <DetailField label="Status"     value={STATUS_LABEL[customer.status]} />
              <DetailField label="Job Title"  value={customer.jobTitle} />
            </FieldGrid>

            <Divider sx={{ mb: 3 }} />

            {/* Contact */}
            <SectionLabel>Contact</SectionLabel>
            <FieldGrid>
              <DetailField label="Email"        value={customer.email} />
              <DetailField label="Phone Number" value={customer.phoneNumber} />
              <DetailField label="Gender"       value={customer.gender !== null ? GENDER_LABEL[customer.gender!] : null} />
              <DetailField label="Age"          value={customer.age?.toString() ?? null} />
            </FieldGrid>

            <Divider sx={{ mb: 3 }} />

            {/* Company */}
            <SectionLabel>Company</SectionLabel>
            <FieldGrid>
              <DetailField label="Company"           value={customer.company} />
              <DetailField label="Industry"          value={customer.industry} />
              <DetailField label="Annual Income"     value={formatNumber(customer.annualIncome)} />
              <DetailField label="Employee Count"    value={formatNumber(customer.employeeCount)} />
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <DetailField label="Headquarters Address" value={customer.headquartersAddress} />
              </Box>
            </FieldGrid>

            <Divider sx={{ mb: 3 }} />

            {/* Timestamps */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <DetailField label="Created At" value={formatDate(customer.createdAt)} />
              <DetailField label="Updated At" value={formatDate(customer.updatedAt)} />
            </Box>
          </CardContent>
        </Card>
      )}

      <DeleteConfirmDialog
        open={dialogOpen}
        customer={customer ?? null}
        onClose={() => setDialogOpen(false)}
        onDeleted={() => navigate('/customers')}
      />
    </Box>
  );
}
