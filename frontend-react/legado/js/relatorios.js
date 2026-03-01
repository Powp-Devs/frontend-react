// Report Creation Functionality

// Sample data for different report types
const reportColumns = {
    vendas: [
        { id: 'data', name: 'Data da Venda', selected: true },
        { id: 'cliente', name: 'Cliente', selected: true },
        { id: 'produto', name: 'Produto', selected: true },
        { id: 'quantidade', name: 'Quantidade', selected: false },
        { id: 'valor_unitario', name: 'Valor Unitário', selected: false },
        { id: 'valor_total', name: 'Valor Total', selected: true },
        { id: 'vendedor', name: 'Vendedor', selected: false },
        { id: 'status', name: 'Status', selected: false },
        { id: 'comissao', name: 'Comissão', selected: false }
    ],
    estoque: [
        { id: 'codigo', name: 'Código do Produto', selected: true },
        { id: 'nome', name: 'Nome do Produto', selected: true },
        { id: 'categoria', name: 'Categoria', selected: true },
        { id: 'quantidade_atual', name: 'Quantidade Atual', selected: true },
        { id: 'quantidade_minima', name: 'Estoque Mínimo', selected: false },
        { id: 'valor_custo', name: 'Valor de Custo', selected: false },
        { id: 'valor_venda', name: 'Valor de Venda', selected: false },
        { id: 'fornecedor', name: 'Fornecedor', selected: false },
        { id: 'localizacao', name: 'Localização', selected: false }
    ],
    financeiro: [
        { id: 'data', name: 'Data', selected: true },
        { id: 'tipo', name: 'Tipo', selected: true },
        { id: 'descricao', name: 'Descrição', selected: true },
        { id: 'valor', name: 'Valor', selected: true },
        { id: 'categoria', name: 'Categoria', selected: false },
        { id: 'conta', name: 'Conta', selected: false },
        { id: 'status', name: 'Status', selected: false },
        { id: 'observacoes', name: 'Observações', selected: false }
    ],
    clientes: [
        { id: 'nome', name: 'Nome', selected: true },
        { id: 'email', name: 'E-mail', selected: true },
        { id: 'telefone', name: 'Telefone', selected: true },
        { id: 'cidade', name: 'Cidade', selected: false },
        { id: 'estado', name: 'Estado', selected: false },
        { id: 'data_cadastro', name: 'Data de Cadastro', selected: false },
        { id: 'ultima_compra', name: 'Última Compra', selected: false },
        { id: 'total_compras', name: 'Total em Compras', selected: false }
    ]
};

// Sample data for preview
const sampleData = {
    vendas: [
        { data: '2024-01-15', cliente: 'João Silva', produto: 'Notebook Dell', valor_total: 'R$ 2.500,00' },
        { data: '2024-01-16', cliente: 'Maria Santos', produto: 'Mouse Wireless', valor_total: 'R$ 85,00' },
        { data: '2024-01-17', cliente: 'Pedro Costa', produto: 'Teclado Mecânico', valor_total: 'R$ 350,00' }
    ],
    estoque: [
        { codigo: 'NB001', nome: 'Notebook Dell Inspiron', categoria: 'Informática', quantidade_atual: '15' },
        { codigo: 'MS002', nome: 'Mouse Logitech', categoria: 'Periféricos', quantidade_atual: '50' },
        { codigo: 'TC003', nome: 'Teclado Mecânico', categoria: 'Periféricos', quantidade_atual: '25' }
    ],
    financeiro: [
        { data: '2024-01-15', tipo: 'Receita', descricao: 'Venda de produtos', valor: 'R$ 2.935,00' },
        { data: '2024-01-16', tipo: 'Despesa', descricao: 'Pagamento de fornecedor', valor: 'R$ 1.200,00' },
        { data: '2024-01-17', tipo: 'Receita', descricao: 'Prestação de serviços', valor: 'R$ 800,00' }
    ],
    clientes: [
        { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999' },
        { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888' },
        { nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(11) 77777-7777' }
    ]
};

// DOM Elements
const reportTypeSelect = document.getElementById('reportType');
const availableColumns = document.getElementById('availableColumns');
const selectedColumns = document.getElementById('selectedColumns');
const previewContent = document.getElementById('previewContent');
const appliedFilters = document.getElementById('appliedFilters');
const periodPreset = document.getElementById('periodPreset');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setDefaultDates();
});

function setupEventListeners() {
    // Report type change
    reportTypeSelect.addEventListener('change', handleReportTypeChange);
    
    // Period preset change
    periodPreset.addEventListener('change', handlePeriodPresetChange);
    
    // Generate report button
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    
    // Save template button
    document.getElementById('saveTemplateBtn').addEventListener('click', saveTemplate);
    
    // Refresh preview button
    document.getElementById('refreshPreviewBtn').addEventListener('click', refreshPreview);
    
    // Add filter buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-filter-btn')) {
            const filterType = e.target.closest('.filter-option').dataset.filter;
            addFilter(filterType);
        }
        
        if (e.target.classList.contains('remove-filter-btn')) {
            e.target.closest('.filter-item').remove();
            updateFiltersDisplay();
        }
        
        if (e.target.classList.contains('add-column-btn')) {
            const columnId = e.target.closest('.column-option').dataset.column;
            addColumn(columnId);
        }
        
        if (e.target.classList.contains('remove-column-btn')) {
            const columnId = e.target.closest('.column-item').dataset.column;
            removeColumn(columnId);
        }
    });
}

function setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
    dateTo.value = today.toISOString().split('T')[0];
}

function handleReportTypeChange() {
    const reportType = reportTypeSelect.value;
    if (reportType) {
        populateColumns(reportType);
        refreshPreview();
    } else {
        clearColumns();
        clearPreview();
    }
}

function handlePeriodPresetChange() {
    const preset = periodPreset.value;
    if (!preset) return;
    
    const today = new Date();
    let startDate, endDate;
    
    switch (preset) {
        case 'today':
            startDate = endDate = today;
            break;
        case 'yesterday':
            startDate = endDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'this-week':
            const dayOfWeek = today.getDay();
            startDate = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
            endDate = today;
            break;
        case 'last-week':
            const lastWeekEnd = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
            startDate = new Date(lastWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
            endDate = lastWeekEnd;
            break;
        case 'this-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'this-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
            break;
        case 'last-year':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
    }
    
    dateFrom.value = startDate.toISOString().split('T')[0];
    dateTo.value = endDate.toISOString().split('T')[0];
}

function populateColumns(reportType) {
    const columns = reportColumns[reportType] || [];
    
    // Clear existing columns
    availableColumns.innerHTML = '';
    selectedColumns.innerHTML = '';
    
    // Populate available columns
    columns.forEach(column => {
        if (!column.selected) {
            const columnOption = createColumnOption(column);
            availableColumns.appendChild(columnOption);
        }
    });
    
    // Populate selected columns
    const selectedCols = columns.filter(col => col.selected);
    if (selectedCols.length > 0) {
        selectedCols.forEach(column => {
            const columnItem = createColumnItem(column);
            selectedColumns.appendChild(columnItem);
        });
    } else {
        selectedColumns.innerHTML = '<p class="no-columns">Nenhuma coluna selecionada</p>';
    }
}

function createColumnOption(column) {
    const div = document.createElement('div');
    div.className = 'column-option';
    div.dataset.column = column.id;
    div.innerHTML = `
        <span>${column.name}</span>
        <button class="add-column-btn">+</button>
    `;
    return div;
}

function createColumnItem(column) {
    const div = document.createElement('div');
    div.className = 'column-item';
    div.dataset.column = column.id;
    div.innerHTML = `
        <span>${column.name}</span>
        <button class="remove-column-btn">×</button>
    `;
    return div;
}

function addColumn(columnId) {
    const reportType = reportTypeSelect.value;
    const column = reportColumns[reportType].find(col => col.id === columnId);
    
    if (column) {
        // Remove from available
        document.querySelector(`[data-column="${columnId}"]`).remove();
        
        // Add to selected
        const columnItem = createColumnItem(column);
        
        // Remove "no columns" message if it exists
        const noColumns = selectedColumns.querySelector('.no-columns');
        if (noColumns) {
            noColumns.remove();
        }
        
        selectedColumns.appendChild(columnItem);
        
        // Update column selection state
        column.selected = true;
        
        refreshPreview();
    }
}

function removeColumn(columnId) {
    const reportType = reportTypeSelect.value;
    const column = reportColumns[reportType].find(col => col.id === columnId);
    
    if (column) {
        // Remove from selected
        document.querySelector(`#selectedColumns [data-column="${columnId}"]`).remove();
        
        // Add to available
        const columnOption = createColumnOption(column);
        availableColumns.appendChild(columnOption);
        
        // Update column selection state
        column.selected = false;
        
        // Check if no columns selected
        if (selectedColumns.children.length === 0) {
            selectedColumns.innerHTML = '<p class="no-columns">Nenhuma coluna selecionada</p>';
        }
        
        refreshPreview();
    }
}

function addFilter(filterType) {
    const filterItem = document.createElement('div');
    filterItem.className = 'filter-item';
    filterItem.innerHTML = `
        <label>${getFilterLabel(filterType)}:</label>
        <select>
            <option value="">Selecione...</option>
            ${getFilterOptions(filterType)}
        </select>
        <button class="remove-filter-btn">×</button>
    `;
    
    // Remove "no filters" message if it exists
    const noFilters = appliedFilters.querySelector('.no-filters');
    if (noFilters) {
        noFilters.remove();
    }
    
    appliedFilters.appendChild(filterItem);
}

function getFilterLabel(filterType) {
    const labels = {
        status: 'Status',
        category: 'Categoria',
        client: 'Cliente',
        product: 'Produto',
        seller: 'Vendedor'
    };
    return labels[filterType] || filterType;
}

function getFilterOptions(filterType) {
    const options = {
        status: '<option value="ativo">Ativo</option><option value="inativo">Inativo</option>',
        category: '<option value="informatica">Informática</option><option value="perifericos">Periféricos</option>',
        client: '<option value="joao">João Silva</option><option value="maria">Maria Santos</option>',
        product: '<option value="notebook">Notebook</option><option value="mouse">Mouse</option>',
        seller: '<option value="vendedor1">Vendedor 1</option><option value="vendedor2">Vendedor 2</option>'
    };
    return options[filterType] || '';
}

function updateFiltersDisplay() {
    if (appliedFilters.children.length === 0) {
        appliedFilters.innerHTML = '<p class="no-filters">Nenhum filtro aplicado</p>';
    }
}

function clearColumns() {
    availableColumns.innerHTML = '';
    selectedColumns.innerHTML = '<p class="no-columns">Nenhuma coluna selecionada</p>';
}

function refreshPreview() {
    const reportType = reportTypeSelect.value;
    
    if (!reportType) {
        clearPreview();
        return;
    }
    
    const selectedCols = reportColumns[reportType].filter(col => col.selected);
    const data = sampleData[reportType] || [];
    
    if (selectedCols.length === 0 || data.length === 0) {
        clearPreview();
        return;
    }
    
    let tableHTML = '<table class="preview-table"><thead><tr>';
    
    // Add headers
    selectedCols.forEach(col => {
        tableHTML += `<th>${col.name}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    // Add data rows
    data.forEach(row => {
        tableHTML += '<tr>';
        selectedCols.forEach(col => {
            tableHTML += `<td>${row[col.id] || '-'}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    
    previewContent.innerHTML = tableHTML;
}

function clearPreview() {
    previewContent.innerHTML = `
        <div class="preview-placeholder">
            <span>📊</span>
            <p>Configure os parâmetros acima para visualizar o relatório</p>
        </div>
    `;
}

function generateReport() {
    const reportName = document.getElementById('reportName').value;
    const reportType = reportTypeSelect.value;
    const reportFormat = document.getElementById('reportFormat').value;
    
    if (!reportName || !reportType) {
        alert('Por favor, preencha o nome e o tipo do relatório.');
        return;
    }
    
    // Simulate report generation
    const loadingHTML = `
        <div class="generating-report">
            <div class="loading-spinner"></div>
            <p>Gerando relatório "${reportName}"...</p>
            <p>Formato: ${reportFormat.toUpperCase()}</p>
        </div>
    `;
    
    previewContent.innerHTML = loadingHTML;
    
    // Simulate async report generation
    setTimeout(() => {
        alert(`Relatório "${reportName}" gerado com sucesso!\nO arquivo será baixado automaticamente.`);
        refreshPreview();
    }, 3000);
}

function saveTemplate() {
    const reportName = document.getElementById('reportName').value;
    
    if (!reportName) {
        alert('Por favor, digite um nome para o modelo.');
        return;
    }
    
    alert(`Modelo "${reportName}" salvo com sucesso!`);
}