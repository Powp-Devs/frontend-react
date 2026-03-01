document.addEventListener('DOMContentLoaded', () => {
    // Dados fictícios - substituir por API
    const dadosFiscais = {
        nfes: [
            { numero: '000001', serie: '1', cliente: 'Empresa ABC Ltda', dataEmissao: '17/11/2025', valorTotal: 'R$ 5.420,00', status: 'autorizada' },
            { numero: '000002', serie: '1', cliente: 'João Silva ME', dataEmissao: '17/11/2025', valorTotal: 'R$ 2.850,00', status: 'autorizada' },
            { numero: '000003', serie: '1', cliente: 'Comércio XYZ', dataEmissao: '17/11/2025', valorTotal: 'R$ 1.890,00', status: 'pendente' },
            { numero: '000004', serie: '1', cliente: 'Maria Santos', dataEmissao: '16/11/2025', valorTotal: 'R$ 3.200,00', status: 'autorizada' },
            { numero: '000005', serie: '1', cliente: 'Tech Solutions', dataEmissao: '16/11/2025', valorTotal: 'R$ 8.500,00', status: 'autorizada' },
            { numero: '000006', serie: '1', cliente: 'Distribuidora Sul', dataEmissao: '16/11/2025', valorTotal: 'R$ 12.300,00', status: 'rejeitada' },
            { numero: '000007', serie: '1', cliente: 'Pedro Oliveira', dataEmissao: '15/11/2025', valorTotal: 'R$ 1.450,00', status: 'autorizada' },
            { numero: '000008', serie: '1', cliente: 'Inovação Digital', dataEmissao: '15/11/2025', valorTotal: 'R$ 6.780,00', status: 'autorizada' },
            { numero: '000009', serie: '1', cliente: 'Ana Costa', dataEmissao: '15/11/2025', valorTotal: 'R$ 4.200,00', status: 'pendente' },
            { numero: '000010', serie: '1', cliente: 'Mercado Central', dataEmissao: '14/11/2025', valorTotal: 'R$ 9.850,00', status: 'autorizada' }
        ]
    };

    // Elementos DOM
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const btnNovaNfe = document.getElementById('btn-nova-nfe');
    const modalNfe = document.getElementById('modal-nfe');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const btnCancelNfe = document.getElementById('btn-cancel-nfe');
    const nfeTableBody = document.getElementById('nfe-table-body');

    // Navegação entre tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Remover active de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Adicionar active na tab clicada
            tab.classList.add('active');
            document.getElementById(`content-${tabName}`).classList.add('active');
        });
    });

    // Preencher tabela de NF-e
    const preencherTabelaNfe = () => {
        nfeTableBody.innerHTML = '';
        
        dadosFiscais.nfes.forEach(nfe => {
            const tr = document.createElement('tr');
            const statusClass = nfe.status;
            const statusText = nfe.status === 'autorizada' ? 'Autorizada' : 
                              nfe.status === 'pendente' ? 'Pendente' : 'Rejeitada';
            
            tr.innerHTML = `
                <td>${nfe.numero}</td>
                <td>${nfe.serie}</td>
                <td>${nfe.cliente}</td>
                <td>${nfe.dataEmissao}</td>
                <td>${nfe.valorTotal}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn" title="Visualizar XML">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                        </svg>
                    </button>
                    <button class="action-btn" title="Download PDF">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn" title="Enviar por E-mail">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                        </svg>
                    </button>
                    ${nfe.status === 'autorizada' ? `
                    <button class="action-btn" title="Cancelar NF-e" style="color: var(--danger-color);">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                        </svg>
                    </button>
                    ` : ''}
                </td>
            `;
            nfeTableBody.appendChild(tr);
        });
    };

    // Abrir modal de nova NF-e
    const abrirModalNfe = () => {
        modalNfe.classList.add('show');
    };

    // Fechar modal
    const fecharModal = () => {
        modalNfe.classList.remove('show');
    };

    // Event Listeners
    btnNovaNfe.addEventListener('click', abrirModalNfe);
    closeModalBtns.forEach(btn => btn.addEventListener('click', fecharModal));
    btnCancelNfe.addEventListener('click', fecharModal);

    // Fechar modal ao clicar fora
    modalNfe.addEventListener('click', (e) => {
        if (e.target === modalNfe) {
            fecharModal();
        }
    });

    // Submit do formulário de NF-e
    const formNfe = document.getElementById('form-nfe');
    formNfe.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simular emissão de NF-e
        alert('NF-e emitida com sucesso!\n\nEm produção, aqui seria feita a integração com a SEFAZ.');
        fecharModal();
        
        // Recarregar tabela (em produção, buscar da API)
        preencherTabelaNfe();
    });

    // Adicionar produto ao formulário de NF-e
    const btnAddProduto = document.getElementById('btn-add-produto');
    const produtosNfe = document.getElementById('produtos-nfe');
    let produtoCount = 0;

    btnAddProduto.addEventListener('click', () => {
        produtoCount++;
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'form-row';
        produtoDiv.style.marginBottom = '16px';
        produtoDiv.innerHTML = `
            <div class="form-group">
                <label>Produto</label>
                <select required>
                    <option value="">Selecione...</option>
                    <option value="1">Mouse Gamer RGB</option>
                    <option value="2">Teclado Mecânico</option>
                    <option value="3">Monitor 24"</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantidade</label>
                <input type="number" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Valor Unitário</label>
                <input type="text" placeholder="R$ 0,00" required>
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
                <button type="button" class="btn btn-outline" onclick="this.parentElement.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </button>
            </div>
        `;
        produtosNfe.appendChild(produtoDiv);
    });

    // Busca e filtros
    const searchInput = document.getElementById('search-fiscal');
    const filterPeriodo = document.getElementById('filter-periodo');

    searchInput.addEventListener('input', (e) => {
        console.log('Buscar:', e.target.value);
        // TODO: Implementar busca com API
    });

    filterPeriodo.addEventListener('change', (e) => {
        console.log('Filtrar por período:', e.target.value);
        // TODO: Implementar filtro com API
    });

    // Inicializar
    preencherTabelaNfe();

    // Exemplo de integração futura com API
    /*
    async function buscarNfes(periodo = 'mes') {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/fiscal/nfe?periodo=${periodo}`);
            const data = await response.json();
            
            dadosFiscais.nfes = data.nfes;
            preencherTabelaNfe();
            
        } catch (error) {
            console.error('Erro ao buscar NF-es:', error);
        }
    }

    async function emitirNfe(dadosNfe) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/fiscal/nfe/emitir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosNfe)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('NF-e emitida com sucesso!');
                buscarNfes();
            } else {
                alert('Erro ao emitir NF-e: ' + result.message);
            }
            
        } catch (error) {
            console.error('Erro ao emitir NF-e:', error);
            alert('Erro ao emitir NF-e. Tente novamente.');
        }
    }
    */
});
