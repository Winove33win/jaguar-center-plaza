# Deploy Jaguar Center Plaza

Este diretório reserva espaço para scripts de publicação futura. O fluxo recomendado consiste em:

1. Publique o repositório via Git no Plesk apontando para `/httpdocs`.
2. Configure a aplicação Node.js com raiz em `/httpdocs/backend`, URL `/api` e arquivo inicial `app.js`.
3. Defina as variáveis de ambiente `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` (não defina `PORT`).
4. Utilize o script de deploy automático na aba **Git → Ações de implantação adicionais**:

   ```bash
   #!/bin/bash
   set -euo pipefail

   cd httpdocs/backend
   if [ -f package-lock.json ]; then
     npm ci --omit=dev
   else
     npm install --omit=dev
   fi

   cd ..
   npm run --prefix backend sync:frontend
   ```

5. Após o deploy, clique em **Reiniciar aplicativo** no painel Node.js para aplicar as atualizações imediatamente.
