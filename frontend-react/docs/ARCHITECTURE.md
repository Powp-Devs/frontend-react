# Arquitetura do Frontend — POWP

> Documento de referência técnica da arquitetura do frontend React.  
> Última atualização: Junho/2026

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Fluxo de Inicialização](#4-fluxo-de-inicialização)
5. [Roteamento](#5-roteamento)
6. [Camada de Serviços](#6-camada-de-serviços)
7. [Custom Hooks](#7-custom-hooks)
8. [Gerenciamento de Estado](#8-gerenciamento-de-estado)
9. [Tipagem](#9-tipagem)
10. [Estilização](#10-estilização)
11. [Configuração do Vite](#11-configuração-do-vite)
12. [Diagrama de Dependências](#12-diagrama-de-dependências)

---

## 1. Visão Geral

O frontend do POWP é uma **SPA (Single Page Application)** construída com React + TypeScript. Toda navegação acontece no browser sem recarregar a página. A comunicação com o servidor é feita exclusivamente via chamadas REST para o backend Python (FastAPI).

### Princípios arquiteturais

- **Separação de responsabilidades** — cada camada tem uma função clara: UI, lógica de negócio e acesso a dados ficam separados
- **Reuso via hooks** — a lógica de estado e efeitos colaterais é encapsulada em custom hooks reutilizáveis
- **Tipagem forte** — TypeScript em todo o projeto, com tipos centralizados em `src/types/`
- **Colocação de código** — estilos, hooks e types ficam próximos de quem os usa

---

## 2. Stack Tecnológica

| Ferramenta | Versão | Camada | Função |
|---|---|---|---|
| **React** | 18 | UI | Biblioteca de componentes |
| **TypeScript** | 4.9 | Toda | Tipagem estática |
| **Vite** | 4 | Build | Dev server e bundler |
| **React Router DOM** | 6 | Navegação | Roteamento client-side |
| **Axios** | 1.3 | HTTP | Requisições à API |
| **@tanstack/react-query** | 5 | Estado | Cache de dados do servidor |
| **MobX + mobx-react-lite** | 6 | Estado | Estado global reativo |
| **Styled Components** | 6 | Estilo | CSS-in-JS |
| **Recharts** | 3 | UI | Gráficos e dashboards |
| **Chart.js** | 4 | UI | Gráficos alternativos |
| **React Icons** | 5 | UI | Biblioteca de ícones |
| **Vitest** | 1 | Testes | Testes unitários |

---

## 3. Estrutura de Pastas

```
frontend-react/
├── src/
│   ├── index.tsx                   ← ponto de entrada — monta o React no DOM
│   ├── App.tsx                     ← componente raiz — define o layout principal
│   ├── vite-env.d.ts               ← declaração de tipos do ambiente Vite
│   │
│   ├── app/                        ← configurações globais da aplicação
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx    ← agrupa BrowserRouter + QueryClient
│   │   │   └── QueryProvider.tsx   ← configura o React Query
│   │   ├── router/
│   │   │   └── index.tsx           ← mapa de todas as rotas
│   │   └── styles/
│   │       └── global.css          ← CSS global (reset, variáveis, etc.)
│   │
│   ├── components/                 ← componentes reutilizáveis em toda a app
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── ToastContext.tsx        ← contexto de notificações
│   │   ├── ToastContainer.tsx      ← renderização dos toasts
│   │   ├── StepModal.tsx           ← modal por etapas (wizard)
│   │   └── CustomSelect.tsx        ← select customizado
│   │
│   ├── shared/
│   │   └── components/
│   │       └── layout/             ← componentes de layout compartilhados
│   │
│   ├── pages/                      ← uma pasta por módulo de negócio
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── cadastro/
│   │   │   ├── CadastroClientes.tsx
│   │   │   ├── CadastroProduto.tsx
│   │   │   ├── CadastroFornecedor.tsx
│   │   │   ├── CadastroFuncionario.tsx
│   │   │   ├── CadastroSetor.tsx
│   │   │   ├── CadastroCategoria.tsx
│   │   │   └── cadastroUsuario.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardClientes.tsx
│   │   │   ├── DashboardEstoque.tsx
│   │   │   └── DashboardVendas.tsx
│   │   ├── estoque/
│   │   │   └── ControleEstoque.tsx
│   │   ├── ia/
│   │   │   └── Chat.tsx
│   │   ├── vendas/
│   │   │   ├── NovoPedido.tsx
│   │   │   ├── Pedidospage.tsx
│   │   │   ├── DashboardPedido.tsx
│   │   │   └── pedidos.utils.ts
│   │   ├── DashboardPage.tsx
│   │   └── OrdersPage.tsx
│   │
│   ├── services/                   ← acesso à API (uma por entidade)
│   │   ├── api.ts                  ← cliente HTTP base (Axios)
│   │   ├── authService.ts
│   │   ├── clienteService.ts
│   │   ├── produtoService.ts
│   │   ├── fornecedorService.ts
│   │   ├── funcionarioService.ts
│   │   ├── pedidoService.ts
│   │   ├── estoqueService.ts
│   │   ├── dashboardService.ts
│   │   ├── chatService.ts
│   │   ├── categoriaService.ts
│   │   ├── setorService.ts
│   │   ├── lancamentoService.ts
│   │   ├── usuarioService.ts
│   │   └── vendaService.ts
│   │
│   ├── hooks/                      ← custom hooks (lógica reutilizável)
│   │   ├── useCRUD.ts              ← hook genérico base
│   │   ├── useClientManager.ts
│   │   ├── useProductManager.ts
│   │   ├── useOrderManager.ts
│   │   ├── useEstoqueManager.ts
│   │   ├── useEmployeeManager.ts
│   │   ├── useSupplierManager.ts
│   │   ├── useCategoryManager.ts
│   │   ├── useSectorManager.ts
│   │   ├── useUserManager.ts
│   │   ├── useForm.ts
│   │   ├── useToast.ts
│   │   └── usePowpApp.ts
│   │
│   ├── types/                      ← interfaces e tipos TypeScript
│   │   ├── index.ts                ← barrel file (re-exporta tudo)
│   │   ├── Client.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Employee.ts
│   │   ├── Employer.ts
│   │   ├── Supplier.ts
│   │   ├── Estoque.ts
│   │   ├── Dashboard.ts
│   │   ├── Login.ts
│   │   ├── Chat.ts
│   │   ├── Category.ts
│   │   ├── Sector.ts
│   │   └── Users.ts
│   │
│   ├── config/
│   │   └── constants.ts            ← constantes globais (rotas, mensagens, URLs)
│   │
│   ├── styles/                     ← CSS por página/componente
│   │   ├── global.css
│   │   ├── login.css
│   │   ├── sidebar.css
│   │   ├── header.css
│   │   ├── cadastroProduto.css
│   │   └── ...
│   │
│   ├── utils/                      ← funções puras utilitárias
│   │   ├── scroll.ts
│   │   └── scroll.test.ts
│   │
│   ├── features/                   ← estrutura de features (em desenvolvimento)
│   │   ├── auth/
│   │   ├── orders/
│   │   └── users/
│   │
│   ├── entities/                   ← entidades de domínio (reservada para expansão)
│   └── Assets/                     ← imagens e ícones estáticos
│       ├── icons/
│       └── imagens/
│
├── __tests__/                      ← testes de integração/páginas
│   └── pages/
│       └── cadastro/
│
├── docs/
│   └── ARCHITECTURE.md             ← este arquivo
│
├── legado/                         ← versão anterior em HTML/JS puro (referência)
│
├── dist/                           ← build de produção (gerado pelo Vite)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.ts
└── README.md
```

---

## 4. Fluxo de Inicialização

A aplicação sobe seguindo esta sequência:

```
index.tsx
│
└── ReactDOM.createRoot(document.getElementById('root'))
     │
     └── <React.StrictMode>
          │
          └── <AppProviders>                  ← 1. Injeta BrowserRouter + QueryClient
               │
               └── <App>
                    │
                    ├── <ToastProvider>        ← 2. Contexto global de notificações
                    │
                    ├── <Sidebar> (condicional) ← 3. Exibida apenas em rotas protegidas
                    │
                    └── <main>
                         │
                         └── <AppRouter>       ← 4. Decide qual página renderizar
```

### O que cada camada faz

**`index.tsx`**  
Único arquivo que toca o DOM diretamente. Cria a root React e renderiza tudo dentro de `<div id="root">`.

**`AppProviders`** (`src/app/providers/AppProviders.tsx`)  
Agrupa os providers que precisam envolver toda a aplicação:
- `BrowserRouter` — habilita o sistema de rotas com History API
- `QueryProvider` — instancia o `QueryClient` do React Query para cache de dados

**`App.tsx`**  
Componente de layout raiz. Lê `useLocation()` para saber a rota atual e decide se renderiza ou não a `Sidebar`. Rotas `/login` e `/register` não mostram o menu lateral.

**`AppRouter`** (`src/app/router/index.tsx`)  
Define todas as rotas e aplica as guards de autenticação.

---

## 5. Roteamento

### Guards de Autenticação

```tsx
// Rota pública — redireciona para /dashboard se já logado
const PublicRoute = () =>
  authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;

// Rota protegida — redireciona para /login se não estiver logado
const ProtectedRoute = () =>
  authService.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
```

A autenticação é verificada checando a existência de `auth_token` no `localStorage`.

### Mapa de Rotas

| Rota | Componente | Tipo | Descrição |
|---|---|---|---|
| `/login` | `LoginPage` | Pública | Tela de autenticação |
| `/register` | `RegisterPage` | Pública | Cadastro de novo usuário |
| `/dashboard` | `DashboardPage` | Protegida | Painel principal |
| `/cadastro-cliente` | `CadastroClientes` | Protegida | CRUD de clientes |
| `/cadastro-produtos` | `CadastroProduto` | Protegida | CRUD de produtos |
| `/cadastro-fornecedor` | `CadastroFornecedor` | Protegida | CRUD de fornecedores |
| `/cadastro-funcionarios` | `CadastroFuncionario` | Protegida | CRUD de funcionários |
| `/cadastro-setor` | `CadastroSetor` | Protegida | CRUD de setores |
| `/cadastro-categoria` | `CadastroCategoria` | Protegida | CRUD de categorias |
| `/cadastro-usuario` | `CadastroUsuario` | Protegida | CRUD de usuários |
| `/estoque` | `ControleEstoque` | Protegida | Gestão de estoque |
| `/vendas` | `NovoPedido` | Protegida | Criação de pedidos |
| `/chat` | `Chat` | Protegida | Chat com IA |
| `/*` | Redirect | — | Redireciona conforme auth |

---

## 6. Camada de Serviços

### ApiClient (`src/services/api.ts`)

Classe central que encapsula o Axios. Todos os outros services a utilizam.

```
ApiClient
├── Interceptor de Request  → injeta Bearer token de todos os requests
├── Interceptor de Response → redireciona para /login em caso de 401
└── Métodos: get | post | put | patch | delete
```

**Configuração:**
- Base URL via `VITE_API_URL` (padrão: `http://127.0.0.1:8000/api`)
- Timeout: 30 segundos
- Content-Type: `application/json`
- Token armazenado em `localStorage` sob a chave `auth_token`

### Services de Entidade

Cada service encapsula os endpoints de uma entidade:

```
services/
├── api.ts              ← instância base do Axios (ApiClient)
│
├── authService.ts      ← POST /usuarios/login
│                          POST /usuarios/register
│                          logout (limpa localStorage)
│
├── clienteService.ts   ← GET/POST/PUT/DELETE /clientes
├── produtoService.ts   ← GET/POST/PUT/DELETE /produtos
├── fornecedorService.ts← GET/POST/PUT/DELETE /fornecedores
├── funcionarioService.ts← GET/POST/PUT/DELETE /funcionarios
├── pedidoService.ts    ← GET/POST/PUT /pedidos
├── estoqueService.ts   ← GET/POST/PUT /estoque
├── dashboardService.ts ← GET /dashboard (dados analíticos)
├── chatService.ts      ← POST /ai/chat
├── categoriaService.ts ← GET/POST/PUT/DELETE /categorias
├── setorService.ts     ← GET/POST/PUT/DELETE /setores
├── usuarioService.ts   ← GET/POST/PUT/DELETE /usuarios
├── vendaService.ts     ← GET/POST /vendas
└── lancamentoService.ts← GET/POST /lancamentos
```

---

## 7. Custom Hooks

### `useCRUD` — Hook Genérico Base

O hook mais importante da aplicação. Encapsula toda a lógica repetitiva de operações CRUD.

**Interface:**
```ts
interface UseCRUDOptions<T> {
  fetchAll: (page: number, pageSize: number) => Promise<{ data: T[] }>;
  create:   (item: Omit<T, 'id'>) => Promise<any>;
  update:   (id: number, item: Partial<T>) => Promise<any>;
  delete:   (id: number) => Promise<any>;
}
```

**O que retorna:**
```
useCRUD retorna
├── Estado
│   ├── items[]          ← lista de registros
│   ├── loading          ← carregando dados
│   ├── isModalOpen      ← modal de criação/edição aberto
│   ├── editingItem      ← item sendo editado (null = novo)
│   ├── formData         ← dados do formulário atual
│   └── currentPage      ← página atual da listagem
│
└── Ações
    ├── fetchItems(page) ← busca registros da API
    ├── handleSave(data) ← cria ou atualiza (detecta automaticamente)
    ├── handleEdit(item) ← abre modal com dados para edição
    ├── handleDelete(id) ← confirma e deleta
    └── handleOpenNew()  ← abre modal em branco para criação
```

**Uso típico em uma página:**
```tsx
const { items, loading, handleSave, handleEdit, handleDelete } = useCRUD({
  fetchAll: clienteService.getAll,
  create:   clienteService.create,
  update:   clienteService.update,
  delete:   clienteService.delete,
});
```

### Hooks Especializados

| Hook | Baseado em | Adiciona |
|---|---|---|
| `useClientManager` | `useCRUD` | Filtros específicos de clientes |
| `useProductManager` | `useCRUD` | Gestão de categorias/estoque |
| `useOrderManager` | `useCRUD` | Cálculo de totais, itens de pedido |
| `useEstoqueManager` | `useCRUD` | Alertas de estoque mínimo |
| `useEmployeeManager` | `useCRUD` | Gestão de setores |
| `useSupplierManager` | `useCRUD` | Filtros de fornecedores |
| `useCategoryManager` | `useCRUD` | — |
| `useSectorManager` | `useCRUD` | — |
| `useUserManager` | `useCRUD` | Gestão de permissões |

### Hooks de Suporte

| Hook | Função |
|---|---|
| `useForm` | Gerencia `formData`, `errors` e `handleChange` de formulários |
| `useToast` | Acessa `showSuccess`, `showError`, `showInfo` do `ToastContext` |
| `usePowpApp` | Inicializa lógica global (sidebar hover, highlight de menu ativo) |

---

## 8. Gerenciamento de Estado

O projeto usa três abordagens, cada uma para um tipo diferente de estado:

### Estado Local do Componente
Usado para estado de UI simples (toggle de modal, valor de input):
```tsx
const [isOpen, setIsOpen] = useState(false);
```

### Estado de Servidor (React Query)
Configurado via `QueryProvider`. Usado para cachear dados da API e evitar requisições desnecessárias:
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['clientes'],
  queryFn: clienteService.getAll,
});
```

### Estado Encapsulado em Custom Hooks
A maioria das páginas usa hooks customizados que gerenciam internamente o estado CRUD (loading, items, modal, form):
```tsx
// A página não gerencia estado diretamente — o hook faz isso
const { items, loading, handleSave } = useClientManager();
```

### MobX (disponível, uso reservado)
`mobx` e `mobx-react-lite` estão instalados para gerenciamento de estado global complexo, mas o uso principal ainda é pelos custom hooks e React Query.

---

## 9. Tipagem

### Barrel File Pattern

`src/types/index.ts` re-exporta todos os tipos:

```ts
// Qualquer parte da app pode importar assim:
import { Client, Product, Order } from '@/types';

// Em vez de precisar saber o caminho exato:
import { Client } from '@/types/Client';
import { Product } from '@/types/Product';
```

### Tipos por Entidade

```
types/
├── Client.ts    → Client, ClientListResponse, Response, PaginatedResponse,
│                  Produto, Estoque, Venda, Fornecedor, Funcionario, Lancamento
├── Employee.ts  → Employee, SortColumn, SortDirection
├── Supplier.ts  → Supplier, SortColumn
├── Product.ts   → Product
├── Order.ts     → Order, OrderItem
├── Estoque.ts   → EstoqueItem
├── Dashboard.ts → DashboardData, ChartData
├── Login.ts     → Login, LoginResponse
├── Chat.ts      → ChatMessage, ChatResponse
├── Category.ts  → Category
├── Sector.ts    → Sector
└── Users.ts     → User, UserRole
```

### Alias de Path

Configurado no `vite.config.ts` e `tsconfig.json`:

```ts
// Ao invés de:
import apiClient from '../../../services/api';

// Use:
import apiClient from '@/services/api';
```

---

## 10. Estilização

### Abordagem Principal — CSS Modular

Cada página/componente tem seu arquivo CSS em `src/styles/`:

```
styles/
├── global.css           ← variáveis CSS, reset, fontes
├── login.css
├── register.css
├── sidebar.css
├── header.css
├── modalShared.css      ← estilos compartilhados de modais
├── stepModal.css
├── cadastroProduto.css
├── cadastroCliente.css
├── cadastroFornecedor.css
├── cadastroFuncionario.css
├── cadastroSetor.css
├── cadastroCategoria.css
├── cadastroUsuario.css
├── controleEstoque.css
├── dashboardPage.css
├── dashboardClientes.css
├── dashboardEstoque.css
├── dashboardVendas.css
├── pedido.css
└── chatBot.css
```

### Abordagem Secundária — Styled Components

Disponível para componentes que precisam de estilização dinâmica baseada em props:

```tsx
const Button = styled.button<{ variant: 'primary' | 'danger' }>`
  background: ${props => props.variant === 'danger' ? 'red' : 'blue'};
`;
```

---

## 11. Configuração do Vite

```ts
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),   // suporte a JSX, Fast Refresh
    svgr()     // importar SVGs como componentes React
  ],
  resolve: {
    alias: { '@': './src' }  // atalho de imports
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:8000'  // evita CORS em dev
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
})
```

### Por que o proxy?

Em desenvolvimento, o frontend roda em `localhost:3000` e o backend em `localhost:8000`. Sem o proxy, o browser bloquearia as requisições por CORS. Com o proxy, o Vite intercepta chamadas para `/api/*` e as encaminha para o backend transparentemente.

---

## 12. Diagrama de Dependências

```
┌─────────────────────────────────────────────────────┐
│                      BROWSER                        │
└─────────────────────────────────────────────────────┘
                         │
                    index.tsx
                         │
              ┌──────────▼──────────┐
              │    AppProviders     │
              │  BrowserRouter      │
              │  QueryProvider      │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │       App.tsx       │
              │   Layout + Sidebar  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     AppRouter       │
              │  Guards de Auth     │
              └──────────┬──────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    ┌──────▼──────┐ ┌────▼────┐ ┌─────▼──────┐
    │   Pages     │ │  Pages  │ │   Pages    │
    │  (auth)     │ │ (CRUD)  │ │ (dashbrd)  │
    └─────────────┘ └────┬────┘ └────────────┘
                         │
              ┌──────────▼──────────┐
              │   Custom Hooks      │
              │  useCRUD / managers │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     Services        │
              │  (por entidade)     │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     ApiClient       │
              │  (Axios + guards)   │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Backend Python     │
              │  FastAPI — :8000    │
              └─────────────────────┘
```

---

## Decisões Técnicas

### Por que React Query em vez de Redux?

O estado da maioria das páginas é **estado de servidor** — dados que vêm da API e precisam de cache, revalidação e sincronização. React Query resolve isso nativamente, sem boilerplate. Redux seria over-engineering para este caso.

### Por que custom hooks em vez de Context API para CRUD?

Context API com estado de CRUD causaria re-renders desnecessários em toda a árvore. Custom hooks isolam o estado por componente/página, sendo mais performáticos e fáceis de testar.

### Por que CSS puro e não Tailwind?

O projeto foi iniciado com CSS puro e styled-components, mantendo consistência com o código legado migrado. Tailwind seria uma mudança de paradigma que exigiria refatoração de toda a base de estilos.

### Por que Vite e não Create React App?

Vite oferece dev server significativamente mais rápido (ESM nativo), build mais otimizado com Rollup, e configuração mais transparente. CRA foi descontinuado pela comunidade.
