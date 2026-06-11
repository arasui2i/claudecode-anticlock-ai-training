import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Link as RouterLink } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';

interface LoginFormValues {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, apiError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { rememberMe: false } });

  const onSubmit = (values: LoginFormValues) => {
    login({
      emailOrUsername: values.emailOrUsername,
      password: values.password,
      rememberMe: values.rememberMe,
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left panel: illustration ─────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 60%, #80deea 100%)',
        }}
      >
        <Box
          component="img"
          src="/illustration-login.svg"
          alt="Login illustration"
          sx={{ maxWidth: 380, width: '100%', opacity: 0.9 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </Box>

      {/* ── Right panel: form ─────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          px: { xs: 3, sm: 6 },
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome Back :)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            To keep connected with us please login with your personal
            information by email address and password.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.emailOrUsername}
              helperText={errors.emailOrUsername?.message}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('emailOrUsername', {
                required: 'Email address is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address.',
                },
              })}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword
                          ? <VisibilityOffOutlinedIcon fontSize="small" />
                          : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password', {
                required: 'Password is required.',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters.',
                },
              })}
            />

            {/* Remember Me + Forgot Password */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <FormControlLabel
                control={<Checkbox size="small" color="success" {...register('rememberMe')} />}
                label={<Typography variant="body2">Remember Me</Typography>}
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                underline="hover"
                color="text.secondary"
              >
                Forgot Password?
              </Link>
            </Box>

            {/* API error */}
            {apiError && (
              <FormHelperText error sx={{ mb: 2, fontSize: '0.875rem' }}>
                {apiError}
              </FormHelperText>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
                sx={{ borderRadius: 5, py: 1.2, textTransform: 'none', fontWeight: 600 }}
              >
                {isPending ? 'Logging in…' : 'Login Now'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 5, py: 1.2, textTransform: 'none', fontWeight: 600 }}
              >
                Create Account
              </Button>
            </Box>

            {/* Social login */}
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Or you can join with
              </Typography>
            </Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
              <IconButton
                aria-label="Sign in with Google"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
              >
                <GoogleIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Sign in with Facebook"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, color: '#1877F2' }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Sign in with Twitter"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, color: '#1DA1F2' }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
            </Box>

          </Box>
        </Box>
      </Box>

    </Box>
  );
}
