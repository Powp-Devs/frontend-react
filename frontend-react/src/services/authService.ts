import apiClient from '@/services/api';

interface LoginRequest {
  usuario: string;
  senha: string;
}

interface UsuarioData {
  nome: string;
  usuario: string;
  codusuario: number;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  usuário: UsuarioData;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/usuarios/login', {
        usuario: credentials.usuario,
        senha: credentials.senha,
      });

      // Salva o token no localStorage
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('token_type', response.token_type);
        if (response.usuário) {
          localStorage.setItem('user', JSON.stringify(response.usuário));
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

  saveRememberedUser(usuario: string): void {
    localStorage.setItem('rememberedUser', usuario);
  }

  getRememberedUser(): string | null {
    return localStorage.getItem('rememberedUser');
  }

  removeRememberedUser(): void {
    localStorage.removeItem('rememberedUser');
  }

  getUserData(): UsuarioData | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();
