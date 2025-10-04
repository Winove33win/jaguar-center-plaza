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

Variáveis de ambiente necessárias:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=Winove-center-plaza
DB_PASSWORD=<sua_senha>
DB_NAME=JaguarPlaza
```

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
