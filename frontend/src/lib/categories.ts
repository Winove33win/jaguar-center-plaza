export const LINKED_CATEGORY_SLUGS = [
  'administracao',
  'advocacia',
  'beleza',
  'contabilidade',
  'imobiliaria',
  'industrias',
  'saude',
  'servicos_publicos'
] as const;

const LINKED_CATEGORY_SET = new Set<string>(LINKED_CATEGORY_SLUGS);

export function normalizeCategorySlug(value?: string | number | null) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return '';
  }

  const withoutDiacritics = stringValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let sanitized = withoutDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!sanitized) {
    return '';
  }

  const duplicateSuffixPattern = /(?:_+\d+)+$/;
  if (duplicateSuffixPattern.test(sanitized)) {
    const withoutSuffix = sanitized.replace(duplicateSuffixPattern, '');

    if (withoutSuffix && LINKED_CATEGORY_SET.has(withoutSuffix)) {
      sanitized = withoutSuffix;
    }
  }

  return sanitized;
}

export function isLinkedCategory(slug?: string | number | null) {
  const normalized = normalizeCategorySlug(slug);
  if (!normalized) {
    return false;
  }

  return LINKED_CATEGORY_SET.has(normalized);
}
