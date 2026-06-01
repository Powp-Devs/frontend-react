import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '@/types/Login';
import authService from '@/services/authService';
import '@/styles/login.css';


const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<Login>({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputStates, setInputStates] = useState({
    username: 'neutral',
    password: 'neutral',
  });
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const rememberedUser = authService.getRememberedUser();
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
    }
    // Trigger mount animation via CSS class
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'username') {
      if (value.trim().length > 0) {
        if (value.includes('@') && !isValidEmail(value)) {
          setInputStates(prev => ({ ...prev, username: 'error' }));
        } else {
          setInputStates(prev => ({ ...prev, username: 'success' }));
        }
      } else {
        setInputStates(prev => ({ ...prev, username: 'neutral' }));
      }
    }

    if (name === 'password') {
      if (value.length > 0) {
        if (value.length < 6) {
          setInputStates(prev => ({ ...prev, password: 'warning' }));
        } else {
          setInputStates(prev => ({ ...prev, password: 'success' }));
        }
      } else {
        setInputStates(prev => ({ ...prev, password: 'neutral' }));
      }
    }
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = formData.username.trim();
    const password = formData.password.trim();

    if (!username) {
      showError('Por favor, digite seu usuário ou e-mail');
      return;
    }
    if (!password) {
      showError('Por favor, digite sua senha');
      return;
    }
    if (password.length < 3) {
      showError('A senha deve ter pelo menos 3 caracteres');
      return;
    }
    if (username.includes('@') && !isValidEmail(username)) {
      showError('Por favor, digite um e-mail válido');
      return;
    }

    if (rememberMe) {
      authService.saveRememberedUser(username);
    } else {
      authService.removeRememberedUser();
    }

    setLoading(true);

    try {
      await authService.login({ username, password });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Erro no Login. Tente novamente.';
      showError(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    navigate('/recuperar-senha');
  };

  return (
    <div className={`login-page ${mounted ? 'mounted' : ''}`}>
      {/* Background particles */}
      <div className="particles-container" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <main>
        <section id="container">

          {/* ── LEFT: image + branding ── */}
          <div id="imagem" aria-hidden="true">
            <div className="image-overlay" />

            {/* Status badge */}
            <div className="status-badge">
              <span className="status-dot" />
              Sistema ativo
            </div>

            <div className="logo-overlay">
              <div className="welcome-animation">
                <h3>Bem-vindo ao</h3>
                <h2>Sistema de Gerenciamento</h2>
                <div className="subtitle">Powp · Distribuição e Varejo</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: form ── */}
          <div id="formulario">
            <div className="form-header">
              <h1>Powp</h1>
              <h2>Distribuição e Varejo</h2>
            </div>

            <form onSubmit={handleSubmit} id="form-login" noValidate>

              {/* Username field */}
              <div className={`input-group ${inputStates.username !== 'neutral' ? `state-${inputStates.username}` : ''}`}>
                <label className="input-label" htmlFor="username">
                  Usuário ou e-mail
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
                    id="username"
                    name="username"
                    required
                    placeholder="seu@email.com"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    aria-describedby={inputStates.username === 'error' ? 'username-error' : undefined}
                  />
                  {inputStates.username === 'success' && (
                    <svg className="input-state-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {inputStates.username === 'error' && (
                    <svg className="input-state-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className={`input-group ${inputStates.password !== 'neutral' ? `state-${inputStates.password}` : ''}`}>
                <label className="input-label" htmlFor="password">
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
                      name="password"
                      id="password"
                      required
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
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

                {/* Password strength indicator */}
                {formData.password.length > 0 && (
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

              {/* Options row */}
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="custom-checkbox" aria-hidden="true" />
                  Lembrar-me
                </label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="loading-spinner" role="status" aria-live="polite">
                  <div className="spinner" aria-hidden="true" />
                  <span>Entrando...</span>
                </div>
              )}

              {/* Error */}
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

              {/* Submit */}
              <button
                type="submit"
                className="btn-entrar"
                disabled={loading}
                aria-busy={loading}
              >
                <span className="btn-text">Entrar</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
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

export default LoginPage;
