# Frontend Jaguar Center Plaza

Aplicação criada com Vite + React + TypeScript e Tailwind CSS.

## Scripts

- `npm run dev`: roda o servidor de desenvolvimento na porta 5173.
- `npm run build`: gera o build de produção em `dist/`.
- `npm run preview`: serve localmente o build de produção.
- `npm run lint`: executa o ESLint.

## Configuração

1. Copie `.env.example` para `.env` e atualize `VITE_API_URL` com o endereço do backend.
2. Instale as dependências com `npm install`.
3. Inicie o ambiente com `npm run dev`.

As páginas são gerenciadas via React Router e utilizam o hook `useSEO` para atualizar metadados dinamicamente.
