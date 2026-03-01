document.addEventListener('DOMContentLoaded', () => {
    // Dados fictícios - simula análise de IA
    const dadosIA = {
        insights: [
            {
                type: 'success',
                icon: '📈',
                title: 'Crescimento Acelerado',
                content: 'Suas vendas cresceram 23% nas últimas 2 semanas, superando a média do setor em 15%.',
                metric: { label: 'Crescimento', value: '+23%' }
            },
            {
                type: 'warning',
                icon: '⚠️',
                title: 'Estoque Crítico Detectado',
                content: '8 produtos estão com estoque abaixo do mínimo. Recomendamos reposição imediata para evitar perda de vendas.',
                metric: { label: 'Produtos', value: '8' }
            },
            {
                type: 'info',
                icon: '💡',
                title: 'Oportunidade de Upsell',
                content: '45 clientes compraram produtos complementares. Há potencial de R$ 28.500 em vendas cruzadas.',
                metric: { label: 'Potencial', value: 'R$ 28.5k' }
            },
            {
                type: 'success',
                icon: '🎯',
                title: 'Meta Mensal em Progresso',
                content: 'Você está 78% da meta mensal com 12 dias restantes. Projeção indica atingimento de 105%.',
                metric: { label: 'Progresso', value: '78%' }
            },
            {
                type: 'danger',
                icon: '🚨',
                title: 'Clientes em Risco',
                content: '12 clientes não compram há mais de 60 dias. Taxa de churn prevista: 35% se não houver ação.',
                metric: { label: 'Em Risco', value: '12' }
            },
            {
                type: 'info',
                icon: '⭐',
                title: 'Produto em Alta',
                content: 'O produto "Mouse Gamer RGB" teve aumento de 156% nas buscas. Considere aumentar estoque.',
                metric: { label: 'Aumento', value: '+156%' }
            }
        ],
        recomendacoes: [
            {
                priority: 'high',
                icon: '🎯',
                title: 'Campanha de Reativação Urgente',
                description: 'Envie ofertas personalizadas para os 12 clientes inativos. Taxa de sucesso estimada: 42%.',
                impact: '+R$ 15.200'
            },
            {
                priority: 'high',
                icon: '📦',
                title: 'Reposição de Estoque Prioritária',
                description: 'Reabasteça os 8 produtos críticos nas próximas 48h para evitar ruptura e perda de R$ 22k.',
                impact: 'Evita -R$ 22.000'
            },
            {
                priority: 'medium',
                icon: '💰',
                title: 'Otimização de Preços',
                description: 'Ajuste preços de 15 produtos com baixa rotação. Aumento de margem estimado em 8%.',
                impact: '+R$ 8.400/mês'
            },
            {
                priority: 'medium',
                icon: '📊',
                title: 'Cross-Sell Automático',
                description: 'Implemente sugestões automáticas de produtos complementares no checkout.',
                impact: '+R$ 12.300/mês'
            },
            {
                priority: 'low',
                icon: '🎁',
                title: 'Programa de Fidelidade',
                description: 'Crie programa de pontos para os top 50 clientes. Aumento de retenção: 28%.',
                impact: '+R$ 18.900/ano'
            },
            {
                priority: 'low',
                icon: '📱',
                title: 'Marketing Digital',
                description: 'Invista em anúncios para produtos de alta margem. ROI estimado: 340%.',
                impact: '+R$ 25.600'
            }
        ],
        oportunidades: [
            {
                title: 'Expansão de Categoria',
                description: 'Clientes buscam produtos de "Acessórios Gaming" que você não oferece.'
            },
            {
                title: 'Horário de Pico',
                description: 'Vendas aumentam 45% entre 19h-21h. Considere promoções nesse período.'
            },
            {
                title: 'Sazonalidade Detectada',
                description: 'Padrão indica aumento de 60% nas vendas nos próximos 15 dias.'
            },
            {
                title: 'Parceria Estratégica',
                description: '3 fornecedores oferecem condições especiais para compra em volume.'
            }
        ],
        riscos: [
            {
                title: 'Concentração de Clientes',
                description: '40% da receita vem de apenas 5 clientes. Diversificação recomendada.'
            },
            {
                title: 'Dependência de Fornecedor',
                description: '65% dos produtos vêm de um único fornecedor. Risco de ruptura alto.'
            },
            {
                title: 'Margem em Queda',
                description: 'Margem média caiu 3% no último mês. Revisar custos operacionais.'
            },
            {
                title: 'Concorrência Agressiva',
                description: 'Concorrentes reduziram preços em 12%. Monitorar impacto nas vendas.'
            }
        ],
        previsaoVendas: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            real: [8500, 9200, 8800, 9500, 10200, 12500, 11800],
            previsto: [9800, 10500, 10200, 11000, 11800, 14200, 13500]
        },
        demandaProdutos: {
            labels: ['Eletrônicos', 'Periféricos', 'Acessórios', 'Componentes', 'Software'],
            atual: [450, 380, 320, 280, 190],
            previsto: [520, 420, 380, 310, 220]
        },
        sentimento: {
            labels: ['Muito Positivo', 'Positivo', 'Neutro', 'Negativo', 'Muito Negativo'],
            valores: [28, 40, 24, 6, 2]
        }
    };

    // Renderizar Insights
    const renderizarInsights = () => {
        const container = document.getElementById('insights-container');
        container.innerHTML = '';
        
        dadosIA.insights.forEach(insight => {
            const card = document.createElement('div');
            card.className = `insight-card ${insight.type}`;
            card.innerHTML = `
                <div class="insight-header">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-title">${insight.title}</div>
                </div>
                <div class="insight-content">${insight.content}</div>
                <div class="insight-metric">
                    <span class="label">${insight.metric.label}</span>
                    <span class="value">${insight.metric.value}</span>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Renderizar Recomendações
    const renderizarRecomendacoes = () => {
        const container = document.getElementById('recommendations-container');
        container.innerHTML = '';
        
        dadosIA.recomendacoes.forEach(rec => {
            const card = document.createElement('div');
            card.className = `recommendation-card priority-${rec.priority}`;
            card.innerHTML = `
                <div class="recommendation-header">
                    <div class="recommendation-icon">${rec.icon}</div>
                    <div class="recommendation-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                </div>
                <div class="recommendation-footer">
                    <span class="priority-badge ${rec.priority}">${
                        rec.priority === 'high' ? 'Alta' : 
                        rec.priority === 'medium' ? 'Média' : 'Baixa'
                    }</span>
                    <span class="impact-value">${rec.impact}</span>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Renderizar Oportunidades
    const renderizarOportunidades = () => {
        const container = document.getElementById('opportunities-list');
        container.innerHTML = '';
        
        dadosIA.oportunidades.forEach(opp => {
            const item = document.createElement('div');
            item.className = 'opportunity-item';
            item.innerHTML = `
                <h4>${opp.title}</h4>
                <p>${opp.description}</p>
            `;
            container.appendChild(item);
        });
    };

    // Renderizar Riscos
    const renderizarRiscos = () => {
        const container = document.getElementById('risks-list');
        container.innerHTML = '';
        
        dadosIA.riscos.forEach(risk => {
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.innerHTML = `
                <h4>${risk.title}</h4>
                <p>${risk.description}</p>
            `;
            container.appendChild(item);
        });
    };

    // Gráfico de Previsão de Vendas
    const criarGraficoPrevisaoVendas = () => {
        const ctx = document.getElementById('previsaoVendasChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dadosIA.previsaoVendas.labels,
                datasets: [
                    {
                        label: 'Vendas Reais',
                        data: dadosIA.previsaoVendas.real,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    },
                    {
                        label: 'Previsão IA',
                        data: dadosIA.previsaoVendas.previsto,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        borderDash: [5, 5]
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

    // Gráfico de Demanda de Produtos
    const criarGraficoDemandaProdutos = () => {
        const ctx = document.getElementById('demandaProdutosChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosIA.demandaProdutos.labels,
                datasets: [
                    {
                        label: 'Demanda Atual',
                        data: dadosIA.demandaProdutos.atual,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderRadius: 6
                    },
                    {
                        label: 'Previsão IA',
                        data: dadosIA.demandaProdutos.previsto,
                        backgroundColor: 'rgba(76, 175, 80, 0.8)',
                        borderRadius: 6
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

    // Gráfico de Sentimento
    const criarGraficoSentimento = () => {
        const ctx = document.getElementById('sentimentChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dadosIA.sentimento.labels,
                datasets: [{
                    data: dadosIA.sentimento.valores,
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(139, 195, 74, 0.8)',
                        'rgba(158, 158, 158, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(229, 57, 53, 0.8)'
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

    // Animar Performance Score
    const animarPerformanceScore = () => {
        const score = 87;
        const circle = document.getElementById('score-progress');
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (score / 100) * circumference;
        
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 500);
    };

    // Atualizar Insights (simula nova análise)
    const atualizarInsights = () => {
        const btn = document.getElementById('refresh-insights');
        btn.disabled = true;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="animation: spin 1s linear infinite;">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
            </svg>
            Atualizando...
        `;
        
        setTimeout(() => {
            renderizarInsights();
            renderizarRecomendacoes();
            renderizarOportunidades();
            renderizarRiscos();
            
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                </svg>
                Atualizar
            `;
        }, 2000);
    };

    // Inicializar Dashboard
    renderizarInsights();
    renderizarRecomendacoes();
    renderizarOportunidades();
    renderizarRiscos();
    criarGraficoPrevisaoVendas();
    criarGraficoDemandaProdutos();
    criarGraficoSentimento();
    animarPerformanceScore();

    // Event Listeners
    document.getElementById('refresh-insights').addEventListener('click', atualizarInsights);

    // Adicionar animação de spin no CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Exemplo de integração futura com API
    /*
    async function fetchInsightsIA() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/ia/insights');
            const data = await response.json();
            
            // Atualizar insights com dados reais da IA
            dadosIA.insights = data.insights;
            dadosIA.recomendacoes = data.recomendacoes;
            
            renderizarInsights();
            renderizarRecomendacoes();
            
        } catch (error) {
            console.error('Erro ao buscar insights da IA:', error);
        }
    }
    
    // Atualizar automaticamente a cada 5 minutos
    setInterval(fetchInsightsIA, 300000);
    */
});
