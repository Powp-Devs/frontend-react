export interface Login {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    nome?: string;
    usuario: string;
    email?: string;
    codusuario?: number;
  };
  usuario?: {
    nome?: string;
    usuario: string;
    email?: string;
    codusuario?: number;
  };
}
