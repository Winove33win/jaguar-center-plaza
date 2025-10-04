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

## Deploy (Plesk)

O fluxo de publicação segue o mesmo padrão adotado pelos demais projetos hospedados no Plesk.

### Estrutura

- O build do frontend (Vite) é servido como arquivos estáticos diretamente de `/httpdocs`.
- A API Node.js roda isolada em `/httpdocs/backend`, com arquivo de inicialização `app.js`.
- A URL do aplicativo Node.js no painel deve ser configurada para responder em `/api`.

### Configuração do Node.js no Plesk

| Campo                 | Valor                     |
| --------------------- | ------------------------- |
| **Raiz do documento** | `/httpdocs`               |
| **Raiz do aplicativo**| `/httpdocs/backend`       |
| **URL do aplicativo** | `/api`                    |
| **Arquivo inicial**   | `app.js`                  |

Variáveis de ambiente necessárias (defina no arquivo `backend/.env`):

```
DB_HOST=<host_do_banco>
DB_PORT=<porta_do_banco>
DB_USER=<usuario_do_banco>
DB_PASSWORD=<senha_do_banco>
DB_NAME=<nome_da_base>
# Opcional: porta local quando executado fora do Plesk
PORT=3333
# Opcional: servir o build do frontend diretamente pela API
SERVE_FRONTEND=true
# Opcional: caminho (relativo ao backend) do build do frontend
FRONTEND_DIST=../dist
```

Para cenários em que apenas a API deve ser executada (sem build ou entrega do frontend), defina a variável de ambiente `SKIP_FRONTEND_BUILD=1` ao rodar o script `npm run --prefix backend sync:frontend` ou simplesmente não execute esse script. Também é possível desabilitar completamente a entrega de arquivos estáticos pela API configurando `SERVE_FRONTEND=false`.

> **Importante:** não defina a variável `PORT`. O Plesk controla automaticamente a porta utilizada pela aplicação Node.js.

### Build e sincronização do frontend

O script abaixo executa o build do frontend e copia o resultado para a pasta pública. Ele deve ser configurado em **Git → Ações de implantação adicionais** no Plesk:

```bash
#!/bin/bash
set -euo pipefail

# 1) Dependências do backend (produção)
cd httpdocs/backend
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

# 2) Build do front e cópia para /httpdocs
cd ..
npm run --prefix backend sync:frontend

# 3) (Opcional) Limpar cache antigo do front
# find ./ -maxdepth 1 -name 'assets' -o -name 'index.html' -print0 | xargs -0r touch
```

Após cada deploy, utilize o botão **Reiniciar aplicativo** no painel de Node.js para garantir que o serviço seja recarregado imediatamente.
