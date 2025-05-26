// frontend/src/types/api.types.ts

// Tipo de usuário (estava faltando)
export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'sindico' | 'funcionario' | 'morador';
  status: 'ativo' | 'inativo';
  telefone?: string;
  cpf?: string;
  avatar_url?: string;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    paginas: number;
  };
}

export interface Condominio {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  cnpj: string;
  email_contato?: string;
  telefone_contato?: string;
  data_inauguracao?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export interface Unidade {
  id: number;
  condominio_id: number;
  usuario_id?: number;
  numero: string;
  bloco?: string;
  andar?: number;
  tipo: 'apartamento' | 'casa' | 'comercial' | 'outro';
  area_privativa?: number;
  fracao_ideal?: number;
  status: 'ocupado' | 'vazio' | 'em_obras';
  observacao?: string;
  valor_base_condominio?: number;
  condominio?: Condominio;
  proprietario?: User;
  created_at: string;
  updated_at: string;
}

export interface Pagamento {
  id: number;
  unidade_id: number;
  tipo: 'condominio' | 'extra' | 'multa' | 'outro';
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  comprovante_url?: string;
  referencia_mes?: number;
  referencia_ano?: number;
  unidade?: Unidade;
  created_at: string;
  updated_at: string;
}

// Tipos adicionais para o dashboard
export interface DashboardData {
  dadosBasicos: {
    totalCondominios: number;
    totalUnidades: number;
    totalUsuarios: number;
    ocupacao: number;
  };
  metricas: {
    receitaMensal: number;
    despesaMensal: number;
    inadimplencia: number;
    manutencoesPendentes: number;
    contratosPorVencer: number;
    estoquesBaixo: number;
  };
  estatisticas: Array<{
    mes: string;
    receita: number;
    despesa: number;
  }>;
  graficoReceitasDespesas: Array<{
    name: string;
    receita: number;
    despesa: number;
  }>;
  ultimasManutencoes: Array<any>;
}