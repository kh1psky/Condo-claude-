// frontend/src/hooks/useApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import api from '../services/api';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

// Hook genérico para requisições GET
export function useApiQuery<T>(
  key: string | (string | number)[],
  url: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number; // Mudou de cacheTime para gcTime no React Query v5
  }
) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get<T>(url);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000, // Era cacheTime
  });
}

// Hook genérico para requisições paginadas
export function usePaginatedQuery<T>(
  key: string,
  url: string,
  params?: Record<string, any>
) {
  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(url, { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook genérico para mutações (POST, PUT, DELETE)
export function useApiMutation<TData = any, TVariables = any>(
  method: 'post' | 'put' | 'delete',
  url: string | ((variables: TVariables) => string),
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    invalidateQueries?: string[];
    showSuccessToast?: boolean;
    successMessage?: string;
    showErrorToast?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const endpoint = typeof url === 'function' ? url(variables) : url;
      
      let response;
      switch (method) {
        case 'post':
          response = await api.post<ApiResponse<TData>>(endpoint, variables);
          break;
        case 'put':
          response = await api.put<ApiResponse<TData>>(endpoint, variables);
          break;
        case 'delete':
          response = await api.delete<ApiResponse<TData>>(endpoint);
          break;
        default:
          throw new Error(`Método ${method} não suportado`);
      }
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Mostrar toast de sucesso
      if (options?.showSuccessToast !== false) {
        toast({
          title: 'Sucesso!',
          description: options?.successMessage || 'Operação realizada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Callback customizado
      if (data.data && options?.onSuccess) {
        options.onSuccess(data.data, variables);
      }
    },
    onError: (error: any, variables) => {
      // Mostrar toast de erro
      if (options?.showErrorToast !== false) {
        const errorMessage = error.response?.data?.error?.message || 'Ocorreu um erro';
        toast({
          title: 'Erro',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      // Callback customizado
      options?.onError?.(error, variables);
    },
  });
}

// Hook específico para upload de arquivos
export function useFileUpload(
  url: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onProgress?: (progress: number) => void;
  }
) {
  const toast = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options?.onProgress?.(progress);
          }
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Upload concluído!',
        description: 'Arquivo enviado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Erro no upload';
      toast({
        title: 'Erro no upload',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      options?.onError?.(error);
    },
  });
}