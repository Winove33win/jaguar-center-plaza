# Backend Jaguar Center Plaza

API em Node.js + Express responsável por servir o conteúdo institucional do Jaguar Center Plaza.

## Scripts

- `npm start`: inicia o servidor em modo produção.
- `npm run dev`: inicia com `nodemon` para recarregar ao salvar arquivos.
- `npm run prestart`: recompila o frontend e sincroniza o build para `backend/dist` (depende de `frontend/`).

## Variáveis de ambiente

| Nome             | Descrição                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| `PORT`           | Porta do servidor HTTP (padrão `4000`).                                   |
| `USE_JSON_DB`    | Se `true`, usa os arquivos em `backend/data/` em vez de MySQL.             |
| `MYSQL_HOST`     | Host do banco MySQL.                                                       |
| `MYSQL_PORT`     | Porta do banco MySQL.                                                      |
| `MYSQL_USER`     | Usuário do banco.                                                          |
| `MYSQL_PASSWORD` | Senha do banco.                                                            |
| `MYSQL_DATABASE` | Banco de dados utilizado.                                                  |
| `FRONTEND_DIST`  | Caminho relativo para os assets do frontend compilado.                     |

## Rotas disponíveis

- `GET /api/categories`: retorna a lista de categorias com empresas. Usa cache em memória.
- `POST /api/contact`: recebe formulários de contato e, quando configurado, grava no banco de dados.

Para ambientes sem banco, defina `USE_JSON_DB=true` e edite `backend/data/companies.json` conforme necessário.
