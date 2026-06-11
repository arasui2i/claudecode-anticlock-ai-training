import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import CustomerListPage from './pages/Customers/CustomerListPage';
import CustomerFormPage from './pages/Customers/CustomerFormPage';
import CustomerDetailPage from './pages/Customers/CustomerDetailPage';

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
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/customers" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
