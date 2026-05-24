import apiClient from '@/services/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      // Salva o token no localStorage
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('token_type', response.token_type);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  saveRememberedUser(username: string): void {
    localStorage.setItem('rememberedUser', username);
  }

  getRememberedUser(): string | null {
    return localStorage.getItem('rememberedUser');
  }

  removeRememberedUser(): void {
    localStorage.removeItem('rememberedUser');
  }
}

export default new AuthService();
