module.exports = {
  allowedTables: [
    'servicos_publicos',
    'administracao',
    'advocacia',
    'beleza',
    'contabilidade',
    'imobiliaria',
    'industrias',
    'lojas',
    'saude'
  ],
  // campos default para busca/ordenação por tabela (use os que existirem)
  defaults: {
    orderBy: {
      '*': 'pk'
    },
    searchFields: {
      '*': ['titulo', 'title', 'descricao', 'descricao', 'endereco', 'email', 'celular', 'nome']
    }
  }
};
