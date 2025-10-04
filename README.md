# Jaguar Center Plaza

Este repositório contém o código-fonte do site institucional do Jaguar Center Plaza, com frontend em React/Vite e backend em Node.js/Express conectado a MariaDB/MySQL.

## Estrutura

- `frontend/`: aplicação React com TypeScript, Tailwind CSS e React Router.
- `backend/`: API Express com integração ao banco de dados.
- `deploy/`: scripts auxiliares de build e deploy.

## Configuração de ambiente

As credenciais do banco devem ser informadas por variáveis de ambiente (compatíveis com o Plesk):

```
DB_HOST=<host_do_banco>
DB_PORT=<porta_do_banco>
DB_USER=<usuario_do_banco>
DB_PASSWORD=<senha_do_banco>
DB_NAME=<nome_da_base>
```

Outras variáveis úteis:

```
PORT=3333 # opcional em desenvolvimento; no Plesk a porta é definida automaticamente
NODE_ENV=development # ou production
```

### Frontend

- `.env.development`: usa a API local (`http://localhost:3333/api`).
- `.env.production`: usa a API publicada (`/api`).

### Passos para desenvolvimento local

1. Instale as dependências na raiz, frontend e backend:
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```
2. Garanta que o banco de dados esteja acessível com as variáveis informadas.
3. Rode o backend:
   ```bash
   npm run dev
   ```
4. Rode o frontend em outra aba/terminal:
   ```bash
   cd frontend
   npm run dev
   ```

## Scripts principais

Os scripts abaixo estão disponíveis na raiz do projeto:

| Script              | Descrição                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| `npm start`         | Inicia a API Express (`backend/app.js`).                                   |
| `npm run dev`       | Inicia a API em modo desenvolvimento com `nodemon`.                       |
| `npm run build:frontend` | Gera o build do frontend com Vite.                                   |
| `npm run sync:frontend`  | Executa o build do frontend e copia o resultado para `backend/public`. |

## Endpoints disponíveis

A API fica exposta em `/api` e utiliza `mysql2/promise` com conversão automática de colunas JSON. Endpoints principais:

- `GET /api/health` → `{ ok: true, time: <ISO> }`
- `GET /api/tables` → `{"tables": ["administracao", "advocacia", ...]}`
- `GET /api/:table` → lista registros da tabela permitida (limite 500, ordenado por data)
- `GET /api/:table/:id` → retorna um registro pelo `id` (UUID)
- `GET /api/_debug/db` → disponível apenas quando `NODE_ENV !== 'production'` (útil para inspeção)

Todas as respostas são em JSON e contam com rate limit (60 requisições/minuto por IP).

## Testes rápidos com `curl`

Substitua `$BASE` pela URL base (ex.: `http://localhost:3333`).

```bash
curl -sS $BASE/api/health
curl -sS $BASE/api/tables
curl -sS "$BASE/api/lojas"
curl -sS "$BASE/api/lojas/<um-id>"
```

## Deploy no Plesk

- **Raiz do aplicativo Node.js:** `/httpdocs/backend`
- **Arquivo inicial:** `app.js`
- **URL do aplicativo:** `/api`
- **Document root:** `/httpdocs`

Certifique-se de definir as variáveis de ambiente (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) diretamente no painel. O backend detecta automaticamente a porta informada pelo Plesk via `PORT`.

Para servir o frontend estático pelo backend:

```bash
npm run sync:frontend
```

O conteúdo gerado ficará em `backend/public` e será exposto a partir de `/`.
