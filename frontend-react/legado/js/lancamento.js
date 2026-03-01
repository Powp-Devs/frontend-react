document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const btnProximo = document.getElementById('btnProximo');
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    const modalSucesso = document.getElementById('modalSucesso');
    const btnNao = document.getElementById('btnNao');
    const btnSim = document.getElementById('btnSim');
    const btnNaoSucesso = document.getElementById('btnNaoSucesso');
    const btnSimSucesso = document.getElementById('btnSimSucesso');

    // Função para abrir modal
    function abrirModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Função para fechar modal
    function fecharModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Função para limpar formulário
    function limparFormulario() {
        const inputs = document.querySelectorAll('.form-input');
        const textarea = document.querySelector('.observations-textarea');
        
        inputs.forEach(input => {
            if (input.type !== 'date') {
                input.value = '';
            }
        });
        
        if (textarea) {
            textarea.value = '';
        }

        // Reset toggle
        const toggleInput = document.getElementById('repetir');
        if (toggleInput) {
            toggleInput.checked = false;
        }

        console.log('Formulário limpo');
    }

    // Event listener para o botão Próximo
    btnProximo.addEventListener('click', function() {
        console.log('Botão Próximo clicado');
        abrirModal(modalConfirmacao);
    });

    // Event listener para o botão Não na confirmação
    btnNao.addEventListener('click', function() {
        console.log('Usuário cancelou o lançamento');
        fecharModal(modalConfirmacao);
    });

    // Event listener para o botão Sim na confirmação
    btnSim.addEventListener('click', function() {
        console.log('Usuário confirmou o lançamento');
        fecharModal(modalConfirmacao);
        
        // Simular processamento
        setTimeout(function() {
            abrirModal(modalSucesso);
        }, 500);
    });

    // Event listener para o botão Não no sucesso
    btnNaoSucesso.addEventListener('click', function() {
        console.log('Usuário não quer fazer outro lançamento');
        fecharModal(modalSucesso);
        // Aqui você pode redirecionar para outra página
        // window.location.href = 'index.html';
    });

    // Event listener para o botão Sim no sucesso
    btnSimSucesso.addEventListener('click', function() {
        console.log('Usuário quer fazer outro lançamento');
        fecharModal(modalSucesso);
        limparFormulario();
    });

    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modalConfirmacao) {
            fecharModal(modalConfirmacao);
        }
        if (event.target === modalSucesso) {
            fecharModal(modalSucesso);
        }
    });

    // Funcionalidade das abas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            console.log('Aba ativada:', this.textContent);
        });
    });

    // Interatividade da sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            console.log('Item da sidebar clicado');
        });
    });

    // Formatação do campo de valor
    const currencyInput = document.querySelector('.currency-input .form-input');
    if (currencyInput) {
        currencyInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value) {
                value = (parseInt(value) / 100).toFixed(2);
                this.value = value.replace('.', ',');
            }
        });
    }

    // Funcionalidade do botão Cancelar
    const btnCancel = document.querySelector('.btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', function() {
            console.log('Cancelar clicado');
            if (confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
                limparFormulario();
                // window.location.href = 'index.html';
            }
        });
    }

    console.log('Página de lançamentos carregada com sucesso');
});
