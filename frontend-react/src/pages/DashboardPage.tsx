import React, { useEffect, useState } from 'react';

interface DashboardCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [cards, setCards] = useState<DashboardCard[]>([
    {
      title: 'Clientes',
      value: 0,
      icon: '👥',
      color: '#3498db',
    },
    {
      title: 'Produtos',
      value: 0,
      icon: '📦',
      color: '#2ecc71',
    },
    {
      title: 'Vendas Hoje',
      value: 0,
      icon: '💰',
      color: '#e74c3c',
    },
    {
      title: 'Em Estoque',
      value: 0,
      icon: '📊',
      color: '#f39c12',
    },
  ]);

  useEffect(() => {
    // Carregar dados do dashboard
    // const loadDashboardData = async () => {
    //   try {
    //     // const clientesResponse = await clienteService.listar();
    //     // setCards(prev => [{ ...prev[0], value: clientesResponse.total }]);
    //   } catch (error) {
    //     console.error('Erro ao carregar dados do dashboard:', error);
    //   }
    // };
    // loadDashboardData();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#333' }}>
        Dashboard
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: `3px solid ${card.color}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div
              style={{
                fontSize: '3rem',
              }}
            >
              {card.icon}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  color: '#888',
                  margin: '0 0 0.5rem 0',
                  fontWeight: 600,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '1.75rem',
                  margin: 0,
                  color: card.color,
                  fontWeight: 700,
                }}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            marginBottom: '1rem',
            color: '#333',
          }}
        >
          Resumo Recente
        </h2>
        <p style={{ color: '#888' }}>
          Nenhum dado disponível no momento. Configure seus dados e volte aqui.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
