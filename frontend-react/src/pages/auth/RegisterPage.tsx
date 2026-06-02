import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '@/services/authService';
import '@/styles/register.css';

interface RegisterForm {
  nome: string;
  email: string;
  usuario: string;
  senha: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    nome: '',
    email: '',
    usuario: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [inputStates, setInputStates] = useState({
    email: 'neutral',
    usuario: 'neutral',
    password: 'neutral',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    requestAnimationFrame(() => setMounted(true));
  }, [navigate]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'email') {
      if (value.trim().length > 0) {
        setInputStates(prev => ({ ...prev, email: isValidEmail(value) ? 'success' : 'error' }));
      } else {
        setInputStates(prev => ({ ...prev, email: 'neutral' }));
      }
    }

    if (name === 'usuario') {
      setInputStates(prev => ({ ...prev, usuario: value.trim().length > 0 ? 'success' : 'neutral' }));
    }

    if (name === 'senha') {
      if (value.length === 0) {
        setInputStates(prev => ({ ...prev, password: 'neutral' }));
      } else if (value.length < 6) {
        setInputStates(prev => ({ ...prev, password: 'warning' }));
      } else {
        setInputStates(prev => ({ ...prev, password: 'success' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.usuario || !formData.senha) {
      setError('Preencha todos os campos.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Digite um e-mail válido.');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      setMessage('Cadastro realizado com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`register-page ${mounted ? 'mounted' : ''}`}>
      <div className="particles-container" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <main>
        <section id="container">
          <div id="formulario" className="register-only">
            <div className="form-header">
              <h1>Cadastro</h1>
              <h2>Crie sua conta</h2>
            </div>

            <form onSubmit={handleSubmit} id="form-login" noValidate>
              <div className="input-group">
                <label className="input-label" htmlFor="nome">
                  Nome completo
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={`input-group ${inputStates.email !== 'neutral' ? `state-${inputStates.email}` : ''}`}>
                <label className="input-label" htmlFor="email">
                  E-mail
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M4 4h16v16H4z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={`input-group ${inputStates.usuario !== 'neutral' ? `state-${inputStates.usuario}` : ''}`}>
                <label className="input-label" htmlFor="usuario">
                  Usuário
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    placeholder="Nome de usuário"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={`input-group ${inputStates.password !== 'neutral' ? `state-${inputStates.password}` : ''}`}>
                <label className="input-label" htmlFor="senha">
                  Senha
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <div className="password-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="senha"
                      name="senha"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={formData.senha}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                {formData.senha.length > 0 && (
                  <div className="password-strength" aria-live="polite">
                    <div className={`strength-bar state-${inputStates.password}`}>
                      <div className="strength-fill" />
                    </div>
                    <span className="strength-label">
                      {inputStates.password === 'warning' ? 'Senha fraca' : 'Senha forte'}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p className="error-message show" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </p>
              )}

              {message && <div className="success-message show">{message}</div>}

              <button type="submit" className="btn-entrar" disabled={loading} aria-busy={loading}>
                <span className="btn-text">Cadastrar</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>

              <div className="register-footer">
                <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
              </div>
            </form>

            <div id="version-container">
              <p id="version">v01.01.02</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
