# Jaguar Center Plaza

Este repositório contém o código-fonte do site institucional do Jaguar Center Plaza, com frontend em React/Vite e backend em Node.js/Express.

## Estrutura

- `frontend/`: aplicação React com TypeScript, Tailwind CSS e React Router.
- `backend/`: API Express que fornece dados das empresas e recebe contatos.
- `deploy/`: scripts auxiliares de build e deploy.

## Configuração rápida

1. Copie `.env.example` para `.env` na raiz do backend e configure as variáveis (como `PORT` e credenciais de banco de dados).
2. Instale as dependências no frontend e backend com `npm install`.
3. Rode `npm run dev` no frontend e `npm start` no backend (ou `npm run dev` para usar nodemon).

O frontend espera que `VITE_API_URL` esteja apontando para o endereço do backend (por padrão, `http://localhost:4000`).

## Deploy

Para gerar os arquivos de produção do frontend dentro da pasta do backend, utilize:

```bash
cd backend
npm run sync:frontend
```

Esse comando executa o build do Vite e copia o resultado para `backend/dist`. Em ambientes como o Plesk, configure o arquivo de inicialização para `app.js` dentro da pasta `backend/`.
