import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNotebookStore } from '../stores/useNotebookStore';
import type { LoginRequest, AuthResponse } from '../types';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useNotebookStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => api.login(data),
    onSuccess: (response: AuthResponse) => {
      localStorage.setItem('token', response.token);
      setUser(response.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
    },
    onError: () => {
      // Even if server logout fails, clear local state
      storeLogout();
      queryClient.clear();
    }
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => api.getProfile(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isAuthenticated,
    profile,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    refetchProfile,
  };
};