# Deploy Jaguar Center Plaza

Este diretório reserva espaço para scripts de publicação futura. O fluxo recomendado consiste em:

1. Rodar `npm run build` dentro de `frontend/` para gerar `frontend/dist`.
2. Executar `npm run sync:frontend` dentro de `backend/` para sincronizar o build com `backend/dist`.
3. Publicar o conteúdo da pasta `backend/` no servidor Node.js desejado. Configure o arquivo de inicialização (`app.js`) no painel da hospedagem.

Caso o ambiente utilize Plesk ou hospedagem estática, copie os arquivos de `backend/dist` para o diretório público e mantenha o
backend como API dedicada.
