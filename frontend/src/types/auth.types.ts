// frontend/src/types/auth.types.ts
export interface User {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    tipo: 'admin' | 'sindico' | 'morador';
    status: 'ativo' | 'inativo';
    ultimo_login?: string;
    unidades?: Array<{
      id: number;
      numero: string;
      bloco?: string;
      condominio: {
        id: number;
        nome: string;
      };
    }>;
    created_at: string;
    updated_at: string;
  }
  
  export interface LoginCredentials {
    email: string;
    senha: string;
  }
  
  export interface RegisterData {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    telefone?: string;
    tipo?: 'admin' | 'sindico' | 'morador';
  }
  
  export interface AuthResponse {
    usuario: User;
    token: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  