# Deploy Jaguar Center Plaza

O fluxo recomendado para publicar no Plesk (modo Node.js) é:

1. Publique o repositório apontando o `Document Root` para `/httpdocs`.
2. Configure a aplicação Node.js com:
   - **Raiz da aplicação**: `/httpdocs/backend`
   - **Arquivo inicial**: `src/server.js`
   - **URL do aplicativo**: `/`
3. Defina as variáveis de ambiente necessárias (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PUBLIC_BASE_URL`, `PORT`, `STRIPE_*`).
4. Instale dependências e gere o build sincronizado sempre que ocorrer um `git pull`:

   ```bash
   #!/bin/bash
   set -euo pipefail

   cd httpdocs/backend
   npm ci --omit=dev
   npm run deploy
   ```

5. Após o deploy, utilize o botão **Reiniciar Aplicativo** no painel Node.js do Plesk.

## Deploy estático

Se preferir servir somente arquivos estáticos (sem Node.js):

1. Execute `npm --prefix backend run deploy` para gerar `backend/dist/` e `backend/httpdocs/`.
2. Publique o conteúdo de `backend/httpdocs/` no diretório público do servidor (ex.: `/httpdocs`).
3. Certifique-se de copiar também `backend/dist/` caso deseje manter a versão compilada junto do repositório.

## Automação opcional

O script `deploy/auto-update.sh` pode ser agendado via cron/Agendador do Plesk para realizar `git pull` seguido de `npm --prefix backend run deploy`, garantindo que o build esteja sempre atualizado.
