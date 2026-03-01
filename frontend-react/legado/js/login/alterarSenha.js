let forcaAtual = 0; // Armazena a força da senha

function verificarForcaSenha() {
    const senha = document.getElementById('nova-senha').value;
    const indicador = document.getElementById('indicador-forca');
    const textoForca = document.getElementById('texto-forca');

    const comprimento = senha.length;
    const temNumeros = /[0-9]/.test(senha);
    const temMinusculas = /[a-z]/.test(senha);
    const temMaiusculas = /[A-Z]/.test(senha);
    const temEspeciais = /[^A-Za-z0-9]/.test(senha);

    let forca = 0;

    if (comprimento > 7) forca += 1;
    if (comprimento > 10) forca += 1;
    if (temNumeros) forca += 1;
    if (temMinusculas) forca += 1;
    if (temMaiusculas) forca += 1;
    if (temEspeciais) forca += 1;

    forcaAtual = forca; // Atualiza a força atual

    let largura = '0%';
    let cor = '#ddd';
    let texto = 'Sem senha';

    if (senha.length > 0) {
        if (forca <= 2) {
            largura = '33%';
            cor = '#ff4d4d';
            texto = 'Fraca';
        } else if (forca <= 4) {
            largura = '66%';
            cor = '#ffd633';
            texto = 'Média';
        } else {
            largura = '100%';
            cor = '#47d147';
            texto = 'Forte';
        }
    }

    indicador.style.width = largura;
    indicador.style.backgroundColor = cor;
    textoForca.textContent = texto;
}

function verificarSenhasIguais() {
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const mensagem = document.getElementById('senha-match-msg');
    const btnAlterar = document.getElementById('btn-alterar');

    if (confirmarSenha.length === 0) {
        mensagem.textContent = '';
        mensagem.className = 'senha-match';
        btnAlterar.disabled = false;
    } else if (novaSenha === confirmarSenha) {
        mensagem.textContent = 'As senhas coincidem';
        mensagem.className = 'senha-match match-success';
        btnAlterar.disabled = false;
    } else {
        mensagem.textContent = 'As senhas não coincidem';
        mensagem.className = 'senha-match match-error';
        btnAlterar.disabled = true;
    }
}

// Cria um popup de sucesso
function mostrarPopupSucesso(mensagem) {
    const popup = document.createElement('div');
    popup.className = 'popup-sucesso';
    popup.innerHTML = `
        <div class="popup-conteudo">
            <p>${mensagem}</p>
            <button id="btn-fechar-popup">OK</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('btn-fechar-popup').addEventListener('click', () => {
        popup.remove();
        window.location.href = 'login.html'; // Redireciona para login após fechar
    });
}

document.getElementById('form-alterar-senha').addEventListener('submit', function(e) {
    e.preventDefault();

    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const mensagemResultado = document.getElementById('mensagem-resultado');

    // Validação
    if (novaSenha !== confirmarSenha) {
        mensagemResultado.textContent = 'As senhas não coincidem. Por favor, verifique.';
        mensagemResultado.className = 'mensagem-resultado mensagem-erro';
        return;
    }

    if (forcaAtual <= 2) {
        mensagemResultado.textContent = 'Por favor, escolha uma senha mais forte.';
        mensagemResultado.className = 'mensagem-resultado mensagem-erro';
        return;
    }

    // Simula sucesso diretamente
    mostrarPopupSucesso('Senha alterada com sucesso!');
});
