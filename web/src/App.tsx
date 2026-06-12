import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import CustomerListPage from './pages/Customers/CustomerListPage';
import CustomerFormPage from './pages/Customers/CustomerFormPage';
import CustomerDetailPage from './pages/Customers/CustomerDetailPage';
import LeadListPage from './pages/Leads/LeadListPage';
import LeadFormPage from './pages/Leads/LeadFormPage';
import ContactListPage from './pages/Contacts/ContactListPage';
import ContactFormPage from './pages/Contacts/ContactFormPage';
import AccountListPage from './pages/Accounts/AccountListPage';
import AccountFormPage from './pages/Accounts/AccountFormPage';
import OpportunityListPage from './pages/Opportunities/OpportunityListPage';
import OpportunityFormPage from './pages/Opportunities/OpportunityFormPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes under AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

            <Route path="/leads" element={<LeadListPage />} />
            <Route path="/leads/new" element={<LeadFormPage />} />
            <Route path="/leads/:id/edit" element={<LeadFormPage />} />

            <Route path="/contacts" element={<ContactListPage />} />
            <Route path="/contacts/new" element={<ContactFormPage />} />
            <Route path="/contacts/:id/edit" element={<ContactFormPage />} />

            <Route path="/accounts" element={<AccountListPage />} />
            <Route path="/accounts/new" element={<AccountFormPage />} />
            <Route path="/accounts/:id/edit" element={<AccountFormPage />} />

            <Route path="/opportunities" element={<OpportunityListPage />} />
            <Route path="/opportunities/new" element={<OpportunityFormPage />} />
            <Route path="/opportunities/:id/edit" element={<OpportunityFormPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/customers" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
