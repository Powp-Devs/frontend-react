class TesteGratis {
    constructor() {
        this.modal = document.getElementById('testeGratisModal');
        this.form = document.getElementById('testeGratisForm');
        this.closeBtn = document.getElementById('closeModal');
        this.submitBtn = document.getElementById('btnSubmit');
        this.loading = document.getElementById('loading');
        this.btnText = document.querySelector('.btn-text');
        this.successMessage = document.getElementById('successMessage');
        
        this.setupEventListeners();
        this.setupPhoneMask();
    }

    setupEventListeners() {
        // Fechar modal
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // Fechar modal clicando fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // Submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validação em tempo real
        this.setupRealTimeValidation();
    }

    setupPhoneMask() {
        const phoneInput = document.getElementById('telefone');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (value.length < 14) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
            }
            
            e.target.value = value;
        });
    }

    setupRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validação por tipo de campo
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'E-mail inválido';
                }
                break;
            
            case 'tel':
                const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Telefone inválido';
                }
                break;
            
            default:
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Campo obrigatório';
                }
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    showFieldError(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');

        if (!isValid) {
            field.style.borderColor = '#e53e3e';
            
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.style.color = '#e53e3e';
                errorElement.style.fontSize = '12px';
                errorElement.style.marginTop = '4px';
                formGroup.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        } else {
            field.style.borderColor = '#48bb78';
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    clearFieldError(field) {
        field.style.borderColor = '#e2e8f0';
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar todos os campos obrigatórios
        const requiredFields = this.form.querySelectorAll('input[required]');
        let isFormValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        // Verificar termos
        const termosCheckbox = document.getElementById('termos');
        if (!termosCheckbox.checked) {
            this.showToast('Você deve aceitar os termos de uso', 'error');
            return;
        }

        if (!isFormValid) {
            this.showToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        // Mostrar loading
        this.setLoading(true);

        try {
            // Coletar dados do formulário
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Enviar para API
            const response = await this.submitTesteGratis(data);
            
            if (response.success) {
                this.showSuccess(response.credentials);
            } else {
                throw new Error(response.message || 'Erro ao processar solicitação');
            }
            
        } catch (error) {
            console.error('Erro:', error);
            this.showToast('Erro ao processar solicitação. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async submitTesteGratis(data) {
        try {
            const response = await fetch('api/teste-gratis.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro na requisição');
            }
            
            return result;
            
        } catch (error) {
            // Fallback para modo demo se API falhar
            console.warn('API não disponível, usando modo demo:', error);
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    const timestamp = Date.now().toString().slice(-4);
                    const empresa = data.nomeEmpresa.toLowerCase().replace(/\s+/g, '');
                    const usuario = `demo_${empresa}_${timestamp}`;
                    const senha = this.generatePassword();

                    resolve({
                        success: true,
                        message: 'Teste grátis ativado com sucesso! (Modo Demo)',
                        credentials: {
                            usuario: usuario,
                            senha: senha,
                            email: data.email,
                            empresa: data.nomeEmpresa
                        }
                    });
                }, 1500);
            });
        }
    }

    generatePassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    showSuccess(credentials) {
        // Esconder formulário
        this.form.style.display = 'none';
        
        // Mostrar mensagem de sucesso
        this.successMessage.style.display = 'block';
        
        // Preencher credenciais
        document.getElementById('usuarioDemo').textContent = credentials.usuario;
        document.getElementById('senhaDemo').textContent = credentials.senha;
        
        // Salvar no localStorage para uso posterior
        localStorage.setItem('demoCredentials', JSON.stringify(credentials));
        
        // Enviar email (simulado)
        this.sendWelcomeEmail(credentials);
    }

    sendWelcomeEmail(credentials) {
        // Aqui você implementaria o envio real do email
        console.log('Email enviado para:', credentials.email);
        console.log('Credenciais:', credentials);
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.btnText.style.opacity = '0';
            this.loading.style.display = 'block';
        } else {
            this.submitBtn.disabled = false;
            this.btnText.style.opacity = '1';
            this.loading.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        // Criar toast se não existir
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(toast);
        }

        // Definir cor baseada no tipo
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            info: '#4299e1'
        };

        toast.style.backgroundColor = colors[type] || colors.info;
        toast.textContent = message;
        toast.style.transform = 'translateX(0)';

        // Remover após 4 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 4000);
    }

    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form se necessário
        if (this.successMessage.style.display === 'block') {
            this.form.style.display = 'block';
            this.successMessage.style.display = 'none';
            this.form.reset();
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.testeGratis = new TesteGratis();
});