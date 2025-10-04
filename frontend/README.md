# Frontend Jaguar Center Plaza

Aplicação criada com Vite + React + TypeScript e Tailwind CSS.

## Scripts

- `npm run dev`: roda o servidor de desenvolvimento na porta 5173.
- `npm run build`: gera o build de produção em `dist/`.
- `npm run preview`: serve localmente o build de produção.
- `npm run lint`: executa o ESLint.

## Configuração

1. Configure o arquivo `.env.development` (já incluso) com `VITE_API_BASE=http://localhost:3333/api` ou ajuste conforme o backend.
2. Para produção/local build, utilize `.env.production` com `VITE_API_BASE=/api`.
3. Instale as dependências com `npm install`.
4. Inicie o ambiente com `npm run dev`.

As páginas são gerenciadas via React Router e utilizam o hook `useSEO` para atualizar metadados dinamicamente.
