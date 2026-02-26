# Powp ERP Frontend (React + TypeScript)

This directory contains the new React/TypeScript front-end application for the Powp ERP project. The original implementation used plain HTML/CSS/JavaScript; the objective is to migrate all pages and scripts into a modern React-based structure.

## Getting Started

1. **Install dependencies**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` to `.env` and adjust `VITE_API_URL` if necessary.

3. **Development**
   ```bash
   npm run start
   ```
   This will start the Vite development server on `http://localhost:5173` by default.

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend-react/
├── public/                # static files (icons, manifest, etc.)
├── src/
│   ├── components/        # reusable UI pieces (Sidebar, Header, etc.)
│   ├── pages/             # each route/page is a React component
│   ├── styles/            # global and component-specific CSS
│   ├── hooks/             # custom hooks (e.g. usePowpApp)
│   └── index.tsx          # entry point
└── tsconfig.json
```

## Migrating Pages

- Each HTML page should become a file under `src/pages` (e.g. `cadastroCliente.html` → `CadastroCliente.tsx`).
- Copy the markup into the component and convert DOM events into React state/hooks.
- Shared elements such as the sidebar, header, modal dialogs, and API utilities belong in `components` or `hooks`.
- Use `react-router-dom` for client-side navigation; update links to `NavLink` or `Link` components.

### Example: CadastroCliente
The component at `src/pages/CadastroCliente.tsx` illustrates how to:

- Define TypeScript interfaces for data objects
- Fetch data with `axios` using `useEffect`
- Render a table with state-driven rows

Continue the pattern for other feature modules (products, vendors, finance, etc.).

## Converting Scripts

All the logic currently in files like `js/app.js`, `js/cadastro/cadastroCliente.js`, etc. should be moved into React hooks or component functions. E.g.:

```ts
// hooks/useSidebar.ts
export function useSidebar() {
  // code previously in setupSidebar()
}
```

In `App.tsx` or a context provider, call these hooks to wire up global behavior.

## Tips

- Keep CSS classes the same initially; you can gradually refactor to CSS modules or styled-components.
- Use the `types` directory to centralize shared TypeScript interfaces (Cliente, Produto, etc.).
- Leverage React Context for authentication state, API base URL, or theme.

Once the first few pages are migrated, the rest follows the same recipe. The goal is a single‑page application (SPA) with fast routing and strongly typed components.
