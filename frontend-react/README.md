# 🚀 Powp ERP - Frontend (React + TypeScript)

Aplicação frontend moderna para o sistema ERP Powp, construída com **React 18**, **TypeScript**, **Vite** e **React Router v6**. Segue arquitetura em camadas com separação clara de responsabilidades.

> 📋 **Para documentação arquitetural completa**, consulte [ARCHITECTURE.md](../ARCHITECTURE.md)

## 🎯 Quick Start

### 1. Instalar Dependências
```bash
cd frontend-react/frontend-react
npm install
```

### 2. Variáveis de Ambiente
```bash
# Crie um arquivo .env (opcional)
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3. Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`

### 4. Build para Produção
```bash
npm run build
```
Gera pasta `/dist` com bundles otimizados.

### 5. Lint
```bash
npm run lint
```

---

## 📁 Estrutura do Projeto

```
frontend-react/
│
├── src/
│   ├── App.tsx                         # Componente raiz
│   ├── index.tsx                       # Ponto de entrada
│   │
│   ├── app/                            # ⭐ Configuração central
│   │   ├── providers/AppProviders.tsx  # Context: Router + QueryClient
│   │   ├── router/index.tsx            # Definição de rotas
│   │   └── styles/global.css           # Estilos globais
│   │
│   ├── pages/                          # ⭐ Páginas/Containers
│   │   ├── DashboardPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── cadastro/
│   │       ├── CadastroClientes.tsx    # CRUD Clientes (hook: useClientManager)
│   │       ├── CadastroFornecedor.tsx  # CRUD Fornecedores (hook: useSupplierManager)
│   │       └── CadastroFuncionario.tsx # CRUD Funcionários (hook: useEmployee)
│   │
│   ├── components/                     # ⭐ Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── hooks/                          # ⭐ Lógica de negócio
│   │   ├── useClientManager.ts         # CRUD + estado + localStorage
│   │   ├── useSupplierManager.ts       # CRUD fornecedores
│   │   ├── useEmployee.ts              # CRUD funcionários
│   │   ├── useCRUD.ts                  # Hook genérico CRUD
│   │   ├── useForm.ts                  # Gerenciamento de formulários
│   │   └── usePowpApp.ts               # Hook da aplicação
│   │
│   ├── services/                       # ⭐ Integração com API
│   │   ├── api.ts                      # Cliente Axios + interceptadores
│   │   ├── clienteService.ts           # Endpoints: listar, criar, atualizar, deletar
│   │   ├── fornecedorService.ts
│   │   ├── funcionarioService.ts
│   │   ├── produtoService.ts
│   │   ├── vendaService.ts
│   │   └── lancamentoService.ts
│   │
│   ├── types/                          # ⭐ TypeScript interfaces (contratos)
│   │   ├── Client.ts                   # Client + tipos relacionados consolidados
│   │   ├── Employee.ts
│   │   ├── Supplier.ts
│   │   └── index.ts                    # Barrel export
│   │
│   ├── styles/                         # ⭐ CSS modular
│   │   ├── global.css
│   │   ├── cadastroCliente.css
│   │   ├── cadastroFornecedor.css
│   │   ├── cadastroFuncionario.css
│   │   └── ... (estilos por página)
│   │
│   ├── config/                         # Configurações constantes
│   │   └── constants.ts
│   │
│   └── shared/                         # Componentes compartilhados
│       └── components/layout/
│
├── public/                             # Arquivos estáticos
├── index.html                          # HTML principal
├── package.json
├── tsconfig.json                       # Configuração TypeScript (strict mode)
├── vite.config.ts                      # Configuração Vite
├── eslint.config.ts                    # ESLint
└── README.md
```

---

## 🏗️ Arquitetura em Camadas

```
┌──────────────────────────────┐
│   Pages + Components (UI)    │  Renderiza elementos, gerencia modal/search
├──────────────────────────────┤
│   Custom Hooks (Business)    │  useClientManager, useSupplierManager, etc
├──────────────────────────────┤
│   Services (API Facade)      │  clienteService, fornecedorService, etc
├──────────────────────────────┤
│   API Client (HTTP)          │  Axios + interceptadores + JWT
├──────────────────────────────┤
│   localStorage / Backend API │  Persistência (mock) ou servidor real
└──────────────────────────────┘
```

Veja [ARCHITECTURE.md](../ARCHITECTURE.md) para explicação detalhada de cada camada.

---

## 🎯 Padrões Implementados

### 1. **Custom Hooks** (Lógica de Negócio)
```tsx
const { clients, addClient, updateClient, deleteClient, getProcessedClients } = useClientManager();
```
- Encapsula CRUD + filtro + ordenação + persistência
- Reutilizável em múltiplos componentes
- Exemplo: [src/hooks/useClientManager.ts](src/hooks/useClientManager.ts)

### 2. **Service Layer** (API Facade)
```tsx
await clienteService.criar(newClient);
await clienteService.listar();
await clienteService.atualizar(id, data);
```
- Centraliza chamadas HTTP
- Facilita testes e mocking
- Exemplo: [src/services/clienteService.ts](src/services/clienteService.ts)

### 3. **Container/Presentational Components**
```tsx
// Container (conexão com lógica)
const CadastroClientes = () => {
  const { clients, addClient } = useClientManager();
  return <ClientTable clients={clients} onAdd={addClient} />;
};

// Presentational (apenas renderiza)
const ClientTable = ({ clients, onAdd }) => (...);
```

### 4. **Type-Safe Throughout**
```tsx
interface Client {
  id: number;
  nome: string;
  email: string;
  // ...
}

// Autocompletar + validação em tempo de compilação
const newClient: Client = { ... };
```

---

## 📡 API Integration

### Status Atual (Mock com localStorage)
O sistema usa dados de exemplo salvos em `localStorage` para desenvolvimento.

### Para Backend Real
1. Descomente as chamadas do backend em `src/hooks/useClientManager.ts`
2. Configure `VITE_API_URL` no `.env`
3. O cliente HTTP já tem interceptadores para JWT:

```tsx
// src/services/api.ts - Automático
request(config) {
  const token = localStorage.getItem('auth_token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

// Tratamento de erro 401
response(error) {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
}
```

---

## 🚀 Adicionar Novo Módulo (CRUD)

Exemplo: Criar novo módulo "Produtos"

### 1. Tipos (`src/types/Product.ts`)
```tsx
export interface Product {
  id: number;
  nome: string;
  preco: number;
  // ...
}
```

### 2. Service (`src/services/produtoService.ts`)
```tsx
export const produtoService = {
  async listar() { ... },
  async criar(data) { ... },
  async atualizar(id, data) { ... },
  async deletar(id) { ... },
};
```

### 3. Hook (`src/hooks/useProductManager.ts`)
```tsx
export function useProductManager() {
  const [products, setProducts] = useState([]);
  // ... CRUD + localStorage
  return { products, addProduct, updateProduct, deleteProduct, ... };
}
```

### 4. Page (`src/pages/cadastro/CadastroProduto.tsx`)
```tsx
const CadastroProduto: React.FC = () => {
  const { products, addProduct, ... } = useProductManager();
  return <div>...</div>;
};
```

### 5. Rota (`src/app/router/index.tsx`)
```tsx
<Route path="/cadastro-produto" element={<CadastroProduto />} />
```

### 6. Menu (`src/components/Sidebar.tsx`)
```tsx
<Link to="/cadastro-produto">Produtos</Link>
```

---

## 📦 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| react | 18.2.0 | UI library |
| typescript | 4.9.4 | Type safety |
| vite | 4.1.0 | Build tool (rápido) |
| react-router-dom | 6.8.0 | Client-side routing |
| axios | 1.3.0 | HTTP client |
| react-query | 5.95.2 | Cache + sync (opcional) |

---

## 🧪 Testes

### Executar ESLint
```bash
npm run lint
```

### Build de Produção
```bash
npm run build
```

Verifica:
- ✅ TypeScript compilation (tsc)
- ✅ Vite bundling
- ✅ ESLint rules
- ✅ Terser minification

---

## ⚙️ Configurações Importantes

### `tsconfig.json`
- **strict: true** - Type-checking rigoroso
- **moduleResolution: bundler** - Path aliases
- **baseUrl: "."** - Suporta `@/` imports

### `vite.config.ts`
- React plugin configurado
- Path alias `@/` para `src/`
- HMR (Hot Module Replacement) habilitado

### `eslint.config.ts`
- ESLint 8.57 com Babel parser
- React/TypeScript rules

---

## 📚 Documentação

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Explicação detalhada da arquitetura (obrigatório ler!)
- **[React Docs](https://react.dev)** - Documentação oficial React
- **[React Router](https://reactrouter.com)** - Client-side routing
- **[Axios Docs](https://axios-http.com)** - HTTP client
- **[Vite Guide](https://vitejs.dev)** - Build tool

---

## 🔧 Troubleshooting

### Porta 3000 já está em uso
```bash
# Vite usará a próxima porta disponível automaticamente
# Ou especifique manualmente:
npm run dev -- --port 3001
```

### Erro: "Cannot find module '@/...'"
Verifique `tsconfig.json` e `vite.config.ts` para path aliases.

### localStorage não persiste
Use `localStorage.setItem()` e `localStorage.getItem()` nos hooks (já implementado).

### API retorna 401 (não autorizado)
Verifique se o token JWT está em `localStorage.getItem('auth_token')`.

---

## 📋 Próximos Passos

- [ ] Conectar ao backend Python (substituir mock por API real)
- [ ] Implementar autenticação JWT completa
- [ ] Adicionar validação de formulários (Zod ou similar)
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Otimizar React Query para caching
- [ ] PWA features

---

**Versão:** 1.0
**Última atualização:** 08/04/2026
**Status:** ✅ Production Ready (com localStorage mock)
