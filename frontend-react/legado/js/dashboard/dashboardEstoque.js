document.addEventListener('DOMContentLoaded', () => {
    // Dados fictícios - substituir por chamadas API no futuro
    const dadosFicticios = {
        kpis: {
            totalProdutos: 1247,
            valorEstoque: 487320.00,
            produtosAlerta: 23,
            produtosZerados: 8
        },
        movimentacao: {
            labels: ['01/11', '05/11', '10/11', '15/11', '20/11', '25/11', '30/11'],
            entradas: [120, 95, 150, 110, 130, 145, 125],
            saidas: [85, 110, 95, 125, 105, 120, 140]
        },
        giroEstoque: {
            labels: ['Eletrônicos', 'Vestuário', 'Alimentos', 'Limpeza', 'Outros'],
            valores: [8.5, 6.2, 12.3, 5.8, 4.1]
        },
        maisVendidos: {
            labels: ['Produto A', 'Produto B', 'Produto C', 'Produto D', 'Produto E'],
            quantidades: [450, 380, 320, 280, 245]
        },
        categorias: {
            labels: ['Eletrônicos', 'Vestuário', 'Alimentos', 'Limpeza', 'Móveis', 'Outros'],
            valores: [320, 285, 210, 165, 142, 125]
        },
        estoqueCritico: [
            { codigo: 'PRD001', produto: 'Mouse Gamer RGB', atual: 5, minimo: 15, status: 'critico' },
            { codigo: 'PRD045', produto: 'Teclado Mecânico', atual: 8, minimo: 20, status: 'critico' },
            { codigo: 'PRD089', produto: 'Webcam HD', atual: 12, minimo: 25, status: 'alerta' },
            { codigo: 'PRD123', produto: 'Headset Bluetooth', atual: 18, minimo: 30, status: 'alerta' },
            { codigo: 'PRD156', produto: 'Monitor 24"', atual: 3, minimo: 10, status: 'critico' }
        ],
        ultimasMovimentacoes: [
            { data: '17/11/2025', produto: 'Mouse Gamer RGB', tipo: 'saida', quantidade: 15, responsavel: 'João Silva' },
            { data: '17/11/2025', produto: 'Teclado Mecânico', tipo: 'entrada', quantidade: 50, responsavel: 'Maria Santos' },
            { data: '16/11/2025', produto: 'Webcam HD', tipo: 'saida', quantidade: 8, responsavel: 'Pedro Costa' },
            { data: '16/11/2025', produto: 'Monitor 24"', tipo: 'entrada', quantidade: 25, responsavel: 'Ana Lima' },
            { data: '15/11/2025', produto: 'Headset Bluetooth', tipo: 'saida', quantidade: 12, responsavel: 'Carlos Souza' }
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
        document.getElementById('total-produtos').textContent = dadosFicticios.kpis.totalProdutos.toLocaleString('pt-BR');
        document.getElementById('valor-estoque').textContent = formatarMoeda(dadosFicticios.kpis.valorEstoque);
        document.getElementById('produtos-alerta').textContent = dadosFicticios.kpis.produtosAlerta;
        document.getElementById('produtos-zerados').textContent = dadosFicticios.kpis.produtosZerados;
    };

    // Gráfico de Movimentação de Estoque
    const criarGraficoMovimentacao = () => {
        const ctx = document.getElementById('movimentacaoChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dadosFicticios.movimentacao.labels,
                datasets: [
                    {
                        label: 'Entradas',
                        data: dadosFicticios.movimentacao.entradas,
                        borderColor: '#43a047',
                        backgroundColor: 'rgba(67, 160, 71, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Saídas',
                        data: dadosFicticios.movimentacao.saidas,
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

    // Gráfico de Giro de Estoque
    const criarGraficoGiro = () => {
        const ctx = document.getElementById('giroChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosFicticios.giroEstoque.labels,
                datasets: [{
                    label: 'Giro (vezes)',
                    data: dadosFicticios.giroEstoque.valores,
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(67, 160, 71, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(96, 125, 139, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
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

    // Gráfico de Produtos Mais Vendidos
    const criarGraficoMaisVendidos = () => {
        const ctx = document.getElementById('maisVendidosChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosFicticios.maisVendidos.labels,
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: dadosFicticios.maisVendidos.quantidades,
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
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Gráfico de Categorias
    const criarGraficoCategorias = () => {
        const ctx = document.getElementById('categoriasChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dadosFicticios.categorias.labels,
                datasets: [{
                    data: dadosFicticios.categorias.valores,
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(67, 160, 71, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(255, 87, 34, 0.8)',
                        'rgba(96, 125, 139, 0.8)'
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

    // Preencher tabela de estoque crítico
    const preencherTabelaEstoqueCritico = () => {
        const tbody = document.querySelector('#estoque-critico-table tbody');
        tbody.innerHTML = '';
        
        dadosFicticios.estoqueCritico.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.codigo}</td>
                <td>${item.produto}</td>
                <td>${item.atual}</td>
                <td>${item.minimo}</td>
                <td><span class="status-badge ${item.status}">${item.status === 'critico' ? 'Crítico' : 'Alerta'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Preencher tabela de últimas movimentações
    const preencherTabelaMovimentacoes = () => {
        const tbody = document.querySelector('#ultimas-movimentacoes-table tbody');
        tbody.innerHTML = '';
        
        dadosFicticios.ultimasMovimentacoes.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.data}</td>
                <td>${item.produto}</td>
                <td><span class="tipo-badge ${item.tipo}">${item.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                <td>${item.quantidade}</td>
                <td>${item.responsavel}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Inicializar dashboard
    atualizarKPIs();
    criarGraficoMovimentacao();
    criarGraficoGiro();
    criarGraficoMaisVendidos();
    criarGraficoCategorias();
    preencherTabelaEstoqueCritico();
    preencherTabelaMovimentacoes();

    // Event listeners para filtros (preparado para integração futura com API)
    document.getElementById('date-filter').addEventListener('change', (e) => {
        console.log('Filtro de data alterado:', e.target.value);
        // TODO: Implementar chamada à API com novo filtro
    });

    document.getElementById('movimentacao-filter').addEventListener('change', (e) => {
        console.log('Filtro de movimentação alterado:', e.target.value);
        // TODO: Atualizar gráfico com novos dados da API
    });

    document.getElementById('giro-filter').addEventListener('change', (e) => {
        console.log('Filtro de giro alterado:', e.target.value);
        // TODO: Atualizar gráfico com novos dados da API
    });

    document.getElementById('vendidos-filter').addEventListener('change', (e) => {
        console.log('Filtro de mais vendidos alterado:', e.target.value);
        // TODO: Atualizar gráfico com novos dados da API
    });
});
