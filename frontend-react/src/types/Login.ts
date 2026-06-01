export interface Login {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
}
