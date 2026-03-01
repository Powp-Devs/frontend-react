// Módulo para importação de XML de Nota Fiscal Eletrônica (NF-e)

class XMLImporter {
    constructor() {
        this.xmlData = null;
        this.parsedData = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.modal = document.getElementById('xml-import-modal');
        this.uploadArea = document.getElementById('upload-area');
        this.xmlFileInput = document.getElementById('xml-file-input');
        this.selectXmlBtn = document.getElementById('select-xml-btn');
        this.xmlPreview = document.getElementById('xml-preview');
        this.xmlItemsTable = document.getElementById('xml-items-table');
        this.saveXmlBtn = document.getElementById('save-xml-btn');
        this.cancelXmlBtn = document.getElementById('cancel-xml-btn');
        this.selectAllItems = document.getElementById('select-all-items');
        
        // Debug: verificar se elementos foram encontrados
        console.log('Elementos inicializados:', {
            modal: !!this.modal,
            uploadArea: !!this.uploadArea,
            xmlFileInput: !!this.xmlFileInput,
            selectXmlBtn: !!this.selectXmlBtn
        });
    }

    attachEventListeners() {
        // Botão para abrir modal
        const importBtn = document.getElementById('import-xml-btn');
        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Botão de importar XML clicado');
                this.openModal();
            });
        } else {
            console.error('Botão import-xml-btn não encontrado!');
        }

        // Botão para selecionar arquivo
        this.selectXmlBtn.addEventListener('click', () => {
            this.xmlFileInput.click();
        });

        // Input de arquivo
        this.xmlFileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.xml')) {
                this.handleFileSelect(file);
            } else {
                this.showToast('Por favor, selecione um arquivo XML válido', 'error');
            }
        });

        // Botões de ação
        this.saveXmlBtn.addEventListener('click', () => this.saveToSystem());
        this.cancelXmlBtn.addEventListener('click', () => this.resetModal());

        // Select all items
        this.selectAllItems.addEventListener('change', (e) => {
            const checkboxes = this.xmlItemsTable.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });

        // Fechar modal
        const closeButtons = this.modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Fechar ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        console.log('Abrindo modal de importação XML');
        if (this.modal) {
            this.modal.classList.add('active');
            this.resetModal();
        } else {
            console.error('Modal não encontrado!');
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    resetModal() {
        this.uploadArea.style.display = 'block';
        this.xmlPreview.style.display = 'none';
        this.xmlFileInput.value = '';
        this.xmlData = null;
        this.parsedData = null;
    }

    handleFileSelect(file) {
        if (!file) return;

        if (!file.name.endsWith('.xml')) {
            this.showToast('Por favor, selecione um arquivo XML válido', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.xmlData = e.target.result;
                this.parseXML(this.xmlData);
            } catch (error) {
                console.error('Erro ao ler arquivo:', error);
                this.showToast('Erro ao ler o arquivo XML', 'error');
            }
        };
        reader.readAsText(file);
    }

    parseXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            // Verificar se há erros no parsing
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML inválido');
            }

            // Extrair dados da NF-e
            const nfeData = this.extractNFeData(xmlDoc);
            
            if (!nfeData) {
                throw new Error('Formato de XML não reconhecido');
            }

            this.parsedData = nfeData;
            this.displayPreview(nfeData);
            
        } catch (error) {
            console.error('Erro ao processar XML:', error);
            this.showToast('Erro ao processar o arquivo XML: ' + error.message, 'error');
        }
    }

    extractNFeData(xmlDoc) {
        // Tentar extrair dados da NF-e (formato padrão brasileiro)
        const ide = xmlDoc.querySelector('ide');
        const emit = xmlDoc.querySelector('emit');
        const total = xmlDoc.querySelector('total ICMSTot');
        const items = xmlDoc.querySelectorAll('det');

        if (!ide || !emit || items.length === 0) {
            return null;
        }

        // Informações da nota
        const nfeInfo = {
            numero: this.getTextContent(ide, 'nNF') || '-',
            serie: this.getTextContent(ide, 'serie') || '-',
            dataEmissao: this.formatDate(this.getTextContent(ide, 'dhEmi') || this.getTextContent(ide, 'dEmi')),
            fornecedor: {
                nome: this.getTextContent(emit, 'xNome') || this.getTextContent(emit, 'xFant') || '-',
                cnpj: this.formatCNPJ(this.getTextContent(emit, 'CNPJ')) || '-'
            },
            valores: {
                total: parseFloat(this.getTextContent(total, 'vNF') || 0),
                produtos: parseFloat(this.getTextContent(total, 'vProd') || 0)
            },
            itens: []
        };

        // Extrair itens
        items.forEach((item, index) => {
            const prod = item.querySelector('prod');
            if (prod) {
                nfeInfo.itens.push({
                    numero: index + 1,
                    codigo: this.getTextContent(prod, 'cProd') || '-',
                    descricao: this.getTextContent(prod, 'xProd') || '-',
                    ncm: this.getTextContent(prod, 'NCM') || '-',
                    unidade: this.getTextContent(prod, 'uCom') || 'UN',
                    quantidade: parseFloat(this.getTextContent(prod, 'qCom') || 0),
                    valorUnitario: parseFloat(this.getTextContent(prod, 'vUnCom') || 0),
                    valorTotal: parseFloat(this.getTextContent(prod, 'vProd') || 0),
                    ean: this.getTextContent(prod, 'cEAN') || '-'
                });
            }
        });

        return nfeInfo;
    }

    getTextContent(parent, tagName) {
        const element = parent.querySelector(tagName);
        return element ? element.textContent.trim() : null;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        
        // Formato: 2024-01-15T10:30:00-03:00 ou 2024-01-15
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatCNPJ(cnpj) {
        if (!cnpj) return '-';
        // Formato: 00.000.000/0000-00
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    displayPreview(nfeData) {
        // Ocultar área de upload e mostrar preview
        this.uploadArea.style.display = 'none';
        this.xmlPreview.style.display = 'block';

        // Preencher informações da nota
        document.getElementById('nfe-numero').textContent = `${nfeData.numero}/${nfeData.serie}`;
        document.getElementById('nfe-data').textContent = nfeData.dataEmissao;
        document.getElementById('nfe-fornecedor').textContent = nfeData.fornecedor.nome;
        document.getElementById('nfe-cnpj').textContent = nfeData.fornecedor.cnpj;
        document.getElementById('nfe-valor').textContent = this.formatCurrency(nfeData.valores.total);
        document.getElementById('nfe-total-itens').textContent = nfeData.itens.length;

        // Preencher tabela de itens
        this.xmlItemsTable.innerHTML = '';
        nfeData.itens.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="item-checkbox" data-index="${index}" checked />
                </td>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.ncm}</td>
                <td>${item.unidade}</td>
                <td>${item.quantidade.toFixed(2)}</td>
                <td>${this.formatCurrency(item.valorUnitario)}</td>
                <td>${this.formatCurrency(item.valorTotal)}</td>
            `;
            this.xmlItemsTable.appendChild(row);
        });
    }

    async saveToSystem() {
        if (!this.parsedData) {
            this.showToast('Nenhum dado para salvar', 'error');
            return;
        }

        // Obter itens selecionados
        const selectedItems = [];
        const checkboxes = this.xmlItemsTable.querySelectorAll('.item-checkbox:checked');
        
        checkboxes.forEach(checkbox => {
            const index = parseInt(checkbox.dataset.index);
            selectedItems.push(this.parsedData.itens[index]);
        });

        if (selectedItems.length === 0) {
            this.showToast('Selecione pelo menos um item para importar', 'warning');
            return;
        }

        // Confirmar importação
        if (!confirm(`Deseja importar ${selectedItems.length} item(ns) para o estoque?`)) {
            return;
        }

        try {
            // Aqui você faria a chamada para a API
            // Por enquanto, vamos simular o salvamento
            
            this.showToast('Processando importação...', 'info');

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Preparar dados para envio
            const importData = {
                nfe: {
                    numero: this.parsedData.numero,
                    serie: this.parsedData.serie,
                    dataEmissao: this.parsedData.dataEmissao,
                    fornecedor: this.parsedData.fornecedor
                },
                itens: selectedItems.map(item => ({
                    codigo: item.codigo,
                    descricao: item.descricao,
                    ncm: item.ncm,
                    unidade: item.unidade,
                    quantidade: item.quantidade,
                    valorUnitario: item.valorUnitario,
                    valorTotal: item.valorTotal,
                    ean: item.ean
                }))
            };

            console.log('Dados para importação:', importData);

            // TODO: Fazer chamada real para API
            // const response = await fetch('/api/estoque/importar-nfe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(importData)
            // });

            this.showToast(`${selectedItems.length} item(ns) importado(s) com sucesso!`, 'success');
            
            // Fechar modal e atualizar tabela
            setTimeout(() => {
                this.closeModal();
                // Recarregar dados da tabela principal
                if (window.loadProducts) {
                    window.loadProducts();
                }
            }, 1500);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.showToast('Erro ao importar dados: ' + error.message, 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando XMLImporter...');
    const importer = new XMLImporter();
    console.log('XMLImporter inicializado:', importer);
    
    // Expor globalmente para debug
    window.xmlImporter = importer;
});
