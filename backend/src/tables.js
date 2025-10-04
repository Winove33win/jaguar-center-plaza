const allowedTables = [
  'servicos_publicos',
  'administracao',
  'advocacia',
  'beleza',
  'contabilidade',
  'imobiliaria',
  'industrias',
  'lojas',
  'saude'
];

const defaults = {
  orderBy: {
    '*': 'pk'
  },
  searchFields: {
    '*': ['titulo', 'title', 'descricao', 'descricao', 'endereco', 'email', 'celular', 'nome']
  }
};

const categoryMetadata = {
  servicos_publicos: {
    id: 'servicos_publicos',
    name: 'Serviços Públicos',
    description: 'Órgãos, concessionárias e serviços essenciais presentes no Jaguar Center Plaza.'
  },
  administracao: {
    id: 'administracao',
    name: 'Administração',
    description: 'Empresas especializadas em gestão empresarial, consultoria e soluções administrativas.'
  },
  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Escritórios de advocacia e consultorias jurídicas que atendem no empreendimento.'
  },
  beleza: {
    id: 'beleza',
    name: 'Beleza & Bem-estar',
    description: 'Salões, barbearias e serviços de estética para quem busca cuidados pessoais.'
  },
  contabilidade: {
    id: 'contabilidade',
    name: 'Contabilidade & Finanças',
    description: 'Contadores, assessorias e empresas de soluções financeiras presentes no centro.'
  },
  imobiliaria: {
    id: 'imobiliaria',
    name: 'Imobiliárias & Condomínios',
    description: 'Negócios do segmento imobiliário que atuam na locação, venda e administração de imóveis.'
  },
  industrias: {
    id: 'industrias',
    name: 'Indústrias & Serviços Técnicos',
    description: 'Empresas industriais e fornecedores técnicos que apoiam os negócios instalados.'
  },
  lojas: {
    id: 'lojas',
    name: 'Lojas & Conveniência',
    description: 'Comércios, serviços e facilidades para o dia a dia de quem circula pelo Jaguar Center Plaza.'
  },
  saude: {
    id: 'saude',
    name: 'Saúde & Bem-estar',
    description: 'Clínicas, consultórios e serviços de saúde que oferecem cuidado integral aos visitantes.'
  }
};

module.exports = {
  allowedTables,
  defaults,
  categoryMetadata
};
