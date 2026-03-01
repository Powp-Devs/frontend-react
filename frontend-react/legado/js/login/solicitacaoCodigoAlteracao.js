const emailInput = document.getElementById('email');
const enviarEmailButton = document.getElementById('enviar-email');
const codigoContainer = document.getElementById('codigo-container');
const mensagemResultado = document.getElementById('mensagem');
const verificarCodigoButton = document.getElementById('verificar-codigo');
const reenviarCodigoButton = document.getElementById('reenviar-codigo');
const codigoInputs = [
    document.getElementById('codigo1'),
    document.getElementById('codigo2'),
    document.getElementById('codigo3'),
    document.getElementById('codigo4')
];

// Função para mover o foco entre os campos do código
function moverFocus(event, nextInputId) {
    if (event.target.value.length === 1) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) nextInput.focus();
    }
}

// Enviar email (Simulação)
enviarEmailButton.addEventListener('click', function() {
    const email = emailInput.value;
    if (email === '') {
        mensagemResultado.textContent = 'Por favor, insira um email válido.';
        mensagemResultado.classList.remove('sucesso');
        return;
    }

    // Simula o envio do email e gera um código de verificação
    setTimeout(function() {
        mensagemResultado.textContent = 'Email enviado com sucesso Verifique sua caixa de entrada.';
        mensagemResultado.classList.add('sucesso');
        document.getElementById('email-container').style.display = 'none';
        codigoContainer.style.display = 'block';
    }, 1000);
});

// Verificar o código
verificarCodigoButton.addEventListener('click', function() {
    const codigo = codigoInputs.map(input => input.value).join('');
            
    if (codigo.length < 4) {
        mensagemResultado.textContent = 'Por favor, insira todos odígitos do código.';
        mensagemResultado.classList.remove('sucesso');
        return;
    }

    // Simula a verificação do código
    if (codigo === '1234') {
        mensagemResultado.textContent = 'Código verificado com sucesso Agora, você pode alterar sua senha.';
        mensagemResultado.classList.add('sucesso');
        setTimeout(() => {
            window.location.href = 'alterar-senhaNovo.html'; // Redireciona para a tela de alteração de senha
        }, 2000);
    } else {
        mensagemResultado.textContent = 'Código inválido. Tente novamente.';
        mensagemResultado.classList.remove('sucesso');
    }
});

// Reenviar código (Simulação)
reenviarCodigoButton.addEventListener('click', function() {
    // Simula o reenviar do código
    setTimeout(function() {
        mensagemResultado.textContent = 'Novo código enviado! Verifique sua caixa de entrada.';
        mensagemResultado.classList.add('sucesso');
        // Limpar os campos de código
        codigoInputs.forEach(input => input.value = '');
    }, 1000);
});