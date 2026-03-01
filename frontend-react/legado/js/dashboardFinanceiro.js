
// Chart.js configuration for cash flow chart
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    
    // Sample data for the cash flow chart
    const chartData = {
        labels: ['06/nov', '07/nov', '08/nov', '09/nov', '09/nov', '09/nov', '09/nov'],
        datasets: [
            {
                label: 'Entradas',
                data: [3000, 6000, 12000, 1000, 18000, 8000, 12000],
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                borderWidth: 1
            },
            {
                label: 'Saídas',
                data: [-4000, -11000, -6000, -8000, -2000, -4000, -10000],
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 1
            }
        ]
    };

    const chartConfig = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: '#f1f3f4'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: '#f1f3f4'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            if (value >= 1000) {
                                return (value / 1000) + 'k';
                            } else if (value <= -1000) {
                                return (value / 1000) + 'k';
                            }
                            return value;
                        }
                    }
                }
            },
            elements: {
                bar: {
                    borderRadius: 4
                }
            }
        }
    };

    new Chart(ctx, chartConfig);

    // Add interactivity to sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add interactivity to tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });

    // Format currency values
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Simulate real-time data updates
    function updateFinancialData() {
        const cardValues = document.querySelectorAll('.card-value');
        const amounts = document.querySelectorAll('.amount-receive, .amount-pay');
        
        // This could be connected to a real API
        console.log('Financial data updated');
    }

    // Update data every 30 seconds (in a real application)
    // setInterval(updateFinancialData, 30000);

    // Handle time selector change
    const timeSelector = document.querySelector('.time-selector');
    timeSelector.addEventListener('change', function() {
        console.log('Time period changed to:', this.value);
        // Here you would typically update the chart with new data
    });
});