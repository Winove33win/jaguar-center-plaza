# Jaguar Center Plaza — Monorepositório

Este projeto reúne o backend Express e o frontend React/Vite do site institucional do Jaguar Center Plaza. O backend serve a API REST, compila e publica o build estático do frontend e expõe serviços auxiliares como geração de sitemap e integração opcional com Stripe.

## Estrutura

- `backend/`: API Node.js/Express que acessa MySQL via `mysql2/promise`, gera sitemaps e orquestra o build do frontend.
- `frontend/`: SPA em React com React Router, TanStack Query, Tailwind CSS e provedores globais (toasts, SEO).
- `scripts/` e `deploy/`: utilitários de build, sincronização e automação de deploy.

## Variáveis de ambiente

### Backend

| Variável               | Descrição                                                                 | Padrão                |
| ---------------------- | ------------------------------------------------------------------------- | --------------------- |
| `DB_HOST`              | Host do MySQL                                                             | `127.0.0.1`           |
| `DB_PORT`              | Porta do MySQL                                                            | `3306`                |
| `DB_USER`              | Usuário do banco                                                          | `root`                |
| `DB_PASSWORD`          | Senha do banco                                                            | `""`                 |
| `DB_NAME`              | Nome do schema                                                            | `JaguarPlaza`         |
| `DB_CONN_LIMIT`        | Máximo de conexões simultâneas                                            | `10`                  |
| `PUBLIC_BASE_URL`      | URL base pública usada para montar links absolutos                        | —                     |
| `PORT`                 | Porta HTTP do Express                                                     | `3333`                |
| `STRIPE_SECRET_KEY`    | Chave secreta do Stripe (opcional)                                        | —                     |
| `STRIPE_PUBLIC_KEY`    | Chave pública usada pelo checkout (opcional)                              | —                     |
| `STRIPE_SERVICE_URL`   | URL de um serviço externo responsável pelo checkout (opcional)           | —                     |
| `STRIPE_WEBHOOK_SECRET`| Segredo de webhook caso o serviço Stripe seja utilizado                   | —                     |

### Frontend

| Variável                | Descrição                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL`          | URL base da API (se vazio, usa o mesmo domínio da SPA)                    |
| `VITE_STRIPE_PUBLIC_KEY`| Chave pública do Stripe para redirecionamento via `@stripe/stripe-js`     |

## Scripts essenciais

### Raiz

| Script                    | Descrição                                                                 |
| ------------------------- | ------------------------------------------------------------------------- |
| `npm start`               | Executa `npm --prefix backend run start`                                 |
| `npm run dev`             | Sobe o backend em modo desenvolvimento (`nodemon`)                       |
| `npm test`                | Lint do frontend (`npm --prefix frontend run lint`)                      |
| `npm run build:frontend`  | Build do frontend com Vite                                               |
| `npm run sync:frontend`   | Executa `scripts/build-and-sync.mjs` para compilar e copiar o `dist`     |

### Backend

| Script            | Descrição                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run start`   | Inicia o servidor Express (`src/server.js`) após executar `scripts/build-and-sync.mjs`                 |
| `npm run dev`     | Desenvolvimento com `nodemon`                                                                          |
| `npm run migrate` | Executa `.sql` em `backend/migrations/` utilizando o pool configurado                                 |
| `npm run sitemap` | Gera `httpdocs/sitemap.xml` e `httpdocs/sitemap.xml.gz` consumindo a própria API                       |
| `npm run deploy`  | Recompila o frontend, sincroniza o build e gera sitemaps estáticos                                     |

### Frontend

| Script        | Descrição                     |
| ------------- | ----------------------------- |
| `npm run dev` | Vite em modo desenvolvimento  |
| `npm run build` | Build de produção            |
| `npm run preview` | Servidor de preview Vite  |
| `npm run lint` | ESLint em `src/`             |

## API REST

O backend expõe os endpoints abaixo (todas as respostas em JSON):

- `GET /api/blog-posts` — Lista e pagina posts do blog (`page`, `perPage`, `search`, `tags`, `orderBy`).
- `GET /api/blog-posts/:slug` — Detalha um post por `slug`.
- `GET /api/cases` — Lista cases com normalização de galerias e URLs absolutas a partir de `PUBLIC_BASE_URL`.
- `GET /api/categories` → Retorna as categorias de empresas com dados publicados diretamente das tabelas do MySQL.
- `GET /api/templates` — Lista templates com conversão de campos JSON (features, preview, metadados).
- `GET /api/templates/:slug` — Detalhe completo do template.
- `POST /api/checkout` — Cria sessão de checkout no Stripe (usa `STRIPE_SECRET_KEY` ou delega para `STRIPE_SERVICE_URL`).
- `POST /api/leads/libras` — Registra leads (formulário Libras/contato) com bloqueio anti-spam em memória.
- `GET /sitemap.xml` — Gera sitemap dinâmico consumindo a própria API (cache em memória + resposta gzip).

O servidor também serve `backend/dist/` (build do frontend) e faz fallback das rotas não reconhecidas para `index.html`.

## Pipeline de build

1. `npm run start` (no backend) executa `scripts/build-and-sync.mjs`, que:
   - Instala dependências do frontend (com `npm ci`, caindo para `npm install` se necessário);
   - Roda `vite build`;
   - Copia `frontend/dist` para `backend/dist`.
2. O Express serve os arquivos estáticos diretamente de `backend/dist`.
3. `npm run sitemap` e `npm run deploy` geram versões estáticas em `backend/httpdocs/` (úteis para hospedagem Plesk/estática).

## Desenvolvimento local

1. Instale as dependências:
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```
2. Configure o banco e rode `npm --prefix backend run migrate` (opcional).
3. Em uma aba, suba o backend:
   ```bash
   npm run dev
   ```
4. Em outra aba, suba o frontend:
   ```bash
   npm --prefix frontend run dev
   ```
5. Acesse `http://localhost:5173` (frontend Vite) consumindo a API em `http://localhost:3333`.

## Deploy

- `backend/scripts/build-and-sync.mjs` é executado automaticamente antes do `npm run start` (prestart).
- `backend/scripts/deploy.mjs` recompila o frontend, sincroniza `backend/dist` e gera sitemaps em `backend/httpdocs`.
- Em ambientes sem Node (ex.: Plesk apenas com estáticos), use `deploy/deploy-plesk.sh` para publicar `httpdocs/`.

## Serviço Stripe auxiliar

O repositório assume a existência opcional do projeto `winove-stripe-system/`, responsável por webhooks e persistência de eventos. Defina as variáveis `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` para habilitar o checkout direto no backend ou configure `STRIPE_SERVICE_URL` para delegar a criação de sessões.

## Tratamento do erro `EADDRINUSE`

Se a porta `3333` já estiver em uso, finalize o processo antigo ou execute o backend em outra porta:

```bash
PORT=8080 npm run start
```

---

Dúvidas e melhorias são bem-vindas via issues e pull requests.
