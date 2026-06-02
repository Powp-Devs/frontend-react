import apiClient from '@/services/api';
import { Login, LoginResponse } from '@/types/Login';

interface RegisterRequest {
  nome: string;
  email: string;
  usuario: string;
  senha: string;
}

interface UsuarioData {
  nome: string;
  usuario: string;
  codusuario: number;
}

interface RegisterResponse {
  message: string;
  usuario: UsuarioData;
}

class AuthService {
  async login(credentials: Login): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/usuarios/login', {
        usuario: credentials.username,
        senha: credentials.password,
      });

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('token_type', response.token_type);
        apiClient.setAuthToken(response.access_token);

        const user = response.user || response.usuario;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/usuarios/register', {
        nome: data.nome,
        email: data.email,
        usuario: data.usuario,
        senha: data.senha,
      });

      return response;
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
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
