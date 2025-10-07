# Assets de apresentações corporativas

Use esta pasta para armazenar imagens, PDFs e outros arquivos estáticos que serão utilizados em apresentações para empresas. Todos os arquivos aqui dentro são servidos pelo Vite/Express a partir de `/presentation-assets`, facilitando o consumo direto no frontend.

## Boas práticas

- Crie subpastas quando necessário (por exemplo, `logotipos/`, `mockups/`, `cases/`).
- Nomeie os arquivos utilizando *kebab-case* e descrevendo o conteúdo (ex.: `fachada-centro-comercial.jpg`).
- Otimize as imagens antes de adicioná-las para reduzir o tamanho do build.
- Atualize os componentes ou páginas que consomem esses arquivos para apontar para `/presentation-assets/<arquivo>`.
- Quando remover um arquivo do código, apague-o desta pasta para evitar ativos órfãos.

## Versionamento

Esta pasta faz parte do repositório. Sempre que adicionar ou remover arquivos relevantes às apresentações, inclua as alterações no commit para manter o histórico atualizado.
