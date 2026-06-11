import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { loginApi, tokenStorage, type LoginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),

    onSuccess(data, variables) {
      setApiError(null);
      tokenStorage.store(data, variables.rememberMe);
      setAuth(data.user, data.accessToken);
      navigate('/customers');
    },

    onError(error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setApiError('Invalid email or password.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    },
  });

  return { ...mutation, apiError };
}
