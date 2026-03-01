// Constantes da aplicação

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  CADASTRO_CLIENTE: '/cadastro-cliente',
  ESTOQUE: '/estoque',
  RELATORIOS: '/relatorios',
  FISCAL: '/fiscal',
} as const;

export const MESSAGES = {
  SUCCESS: 'Operação realizada com sucesso!',
  ERROR: 'Erro ao realizar operação. Tente novamente.',
  LOADING: 'Carregando...',
  NO_DATA: 'Nenhum dado encontrado',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
