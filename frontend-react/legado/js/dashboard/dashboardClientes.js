document.addEventListener('DOMContentLoaded', () => {
    // Dados fictícios - substituir por chamadas API no futuro
    const dadosFicticios = {
        kpis: {
            totalClientes: 1847,
            clientesAtivos: 1523,
            ticketMedio: 1245.00,
            taxaRetencao: 87.5
        },
        evolucao: {
            labels: ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
            novos: [145, 168, 192, 175, 203, 218],
            ativos: [1205, 1298, 1356, 1412, 1478, 1523],
            inativos: [95, 102, 88, 76, 82, 74]
        },
        segmentacao: {
            labels: ['Pessoa Física', 'Pessoa Jurídica', 'MEI', 'Outros'],
            valores: [856, 642, 285, 64]
        },
        topClientes: {
            labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E', 
                     'Cliente F', 'Cliente G', 'Cliente H', 'Cliente I', 'Cliente J'],
            faturamento: [45200, 38900, 32500, 28700, 25400, 22100, 19800, 17500, 15200, 13800]
        },
        geografica: {
            labels: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Bahia', 'Outros'],
            valores: [542, 328, 245, 198, 156, 378]
        },
        churn: [
            { 
                cliente: 'Empresa ABC Ltda', 
                ultimaCompra: '15/09/2025', 
                valorTotal: 'R$ 45.200,00', 
                risco: 'alto' 
            },
            { 
                cliente: 'João Silva ME', 
                ultimaCompra: '22/09/2025', 
                valorTotal: 'R$ 28.500,00', 
                risco: 'alto' 
            },
            { 
                cliente: 'Comércio XYZ', 
                ultimaCompra: '05/10/2025', 
                valorTotal: 'R$ 18.900,00', 
                risco: 'medio' 
            },
            { 
                cliente: 'Maria Santos', 
                ultimaCompra: '12/10/2025', 
                valorTotal: 'R$ 12.300,00', 
                risco: 'medio' 
            },
            { 
                cliente: 'Tech Solutions', 
                ultimaCompra: '18/10/2025', 
                valorTotal: 'R$ 32.100,00', 
                risco: 'medio' 
            }
        ],
        novosClientes: [
            { 
                cliente: 'Inovação Digital', 
                dataCadastro: '15/11/2025', 
                primeiraCompra: 'R$ 3.200,00', 
                valor: 'R$ 3.200,00', 
                status: 'ativo' 
            },
            { 
                cliente: 'Pedro Oliveira', 
                dataCadastro: '14/11/2025', 
                primeiraCompra: 'R$ 1.850,00', 
                valor: 'R$ 1.850,00', 
                status: 'ativo' 
            },
            { 
                cliente: 'Distribuidora Sul', 
                dataCadastro: '13/11/2025', 
                primeiraCompra: 'R$ 8.500,00', 
                valor: 'R$ 8.500,00', 
                status: 'ativo' 
            },
            { 
                cliente: 'Ana Costa', 
                dataCadastro: '12/11/2025', 
                primeiraCompra: '-', 
                valor: 'R$ 0,00', 
                status: 'pendente' 
            },
            { 
                cliente: 'Mercado Central', 
                dataCadastro: '11/11/2025', 
                primeiraCompra: 'R$ 5.400,00', 
                valor: 'R$ 5.400,00', 
                status: 'ativo' 
            }
        ]
    };

    // Função para formatar valores monetários
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    // Atualizar KPIs
    const atualizarKPIs = () => {
        document.getElementById('total-clientes').textContent = 
            dadosFicticios.kpis.totalClientes.toLocaleString('pt-BR');
        document.getElementById('clientes-ativos').textContent = 
            dadosFicticios.kpis.clientesAtivos.toLocaleString('pt-BR');
        document.getElementById('ticket-medio').textContent = 
            formatarMoeda(dadosFicticios.kpis.ticketMedio);
        document.getElementById('taxa-retencao').textContent = 
            dadosFicticios.kpis.taxaRetencao.toFixed(1) + '%';
    };

    // Gráfico de Evolução de Clientes
    const criarGraficoEvolucao = () => {
        const ctx = document.getElementById('evolucaoChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dadosFicticios.evolucao.labels,
                datasets: [
                    {
                        label: 'Novos Clientes',
                        data: dadosFicticios.evolucao.novos,
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Clientes Ativos',
                        data: dadosFicticios.evolucao.ativos,
                        borderColor: '#43a047',
                        backgroundColor: 'rgba(67, 160, 71, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Clientes Inativos',
                        data: dadosFicticios.evolucao.inativos,
                        borderColor: '#e53935',
                        backgroundColor: 'rgba(229, 57, 53, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Gráfico de Segmentação
    const criarGraficoSegmentacao = () => {
        const ctx = document.getElementById('segmentacaoChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dadosFicticios.segmentacao.labels,
                datasets: [{
                    data: dadosFicticios.segmentacao.valores,
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(67, 160, 71, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(255, 152, 0, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };

    // Gráfico Top Clientes
    const criarGraficoTopClientes = () => {
        const ctx = document.getElementById('topClientesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosFicticios.topClientes.labels,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: dadosFicticios.topClientes.faturamento,
                    backgroundColor: 'rgba(0, 77, 64, 0.8)',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    };

    // Gráfico Geográfico
    const criarGraficoGeografico = () => {
        const ctx = document.getElementById('geograficaChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dadosFicticios.geografica.labels,
                datasets: [{
                    data: dadosFicticios.geografica.valores,
                    backgroundColor: [
                        'rgba(0, 77, 64, 0.8)',
                        'rgba(0, 121, 107, 0.8)',
                        'rgba(38, 166, 154, 0.8)',
                        'rgba(77, 182, 172, 0.8)',
                        'rgba(128, 203, 196, 0.8)',
                        'rgba(178, 223, 219, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    };

    // Preencher tabela de churn
    const preencherTabelaChurn = () => {
        const tbody = document.querySelector('#churn-table tbody');
        tbody.innerHTML = '';
        
        dadosFicticios.churn.forEach(item => {
            const tr = document.createElement('tr');
            const riscoTexto = item.risco === 'alto' ? 'Alto' : item.risco === 'medio' ? 'Médio' : 'Baixo';
            tr.innerHTML = `
                <td>${item.cliente}</td>
                <td>${item.ultimaCompra}</td>
                <td>${item.valorTotal}</td>
                <td><span class="risk-badge ${item.risco}">${riscoTexto}</span></td>
                <td><button class="btn-action">Contatar</button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Preencher tabela de novos clientes
    const preencherTabelaNovosClientes = () => {
        const tbody = document.querySelector('#novos-clientes-table tbody');
        tbody.innerHTML = '';
        
        dadosFicticios.novosClientes.forEach(item => {
            const tr = document.createElement('tr');
            const statusTexto = item.status === 'ativo' ? 'Ativo' : 'Pendente';
            tr.innerHTML = `
                <td>${item.cliente}</td>
                <td>${item.dataCadastro}</td>
                <td>${item.primeiraCompra}</td>
                <td>${item.valor}</td>
                <td><span class="status-badge ${item.status}">${statusTexto}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Inicializar dashboard
    atualizarKPIs();
    criarGraficoEvolucao();
    criarGraficoSegmentacao();
    criarGraficoTopClientes();
    criarGraficoGeografico();
    preencherTabelaChurn();
    preencherTabelaNovosClientes();

    // Event listeners para filtros (preparado para integração futura com API)
    document.getElementById('date-filter').addEventListener('change', (e) => {
        console.log('Filtro de data alterado:', e.target.value);
        // TODO: Implementar chamada à API com novo filtro
        // Exemplo: fetchDadosClientes(e.target.value);
    });

    document.getElementById('evolucao-filter').addEventListener('change', (e) => {
        console.log('Filtro de evolução alterado:', e.target.value);
        // TODO: Atualizar gráfico com novos dados da API
    });

    document.getElementById('top-clientes-filter').addEventListener('change', (e) => {
        console.log('Filtro de top clientes alterado:', e.target.value);
        // TODO: Atualizar gráfico com novos dados da API
    });

    // Exemplo de função para integração futura com API
    /*
    async function fetchDadosClientes(periodo) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/dashboard/clientes?periodo=${periodo}`);
            const data = await response.json();
            
            // Atualizar KPIs
            document.getElementById('total-clientes').textContent = data.kpis.totalClientes;
            // ... atualizar outros elementos
            
            // Atualizar gráficos
            // ... código para atualizar gráficos com novos dados
            
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }
    */
});
