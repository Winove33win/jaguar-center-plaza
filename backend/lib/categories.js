export const CATEGORIES = [
  { name: 'Administração', slug: 'administracao', table: 'administracao' },
  { name: 'Advocacia', slug: 'advocacia', table: 'advocacia' },
  { name: 'Beleza', slug: 'beleza', table: 'beleza' },
  { name: 'Contabilidade', slug: 'contabilidade', table: 'contabilidade' },
  { name: 'Imobiliária', slug: 'imobiliaria', table: 'imobiliaria' },
];

export const bySlug = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category]));
