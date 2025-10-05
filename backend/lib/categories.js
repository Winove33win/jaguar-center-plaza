import { COMPANY_CATEGORIES } from '../src/config/company-categories.js';

export const CATEGORIES = COMPANY_CATEGORIES.map((category) => ({
  ...category,
  slug: category.slug ?? category.id,
}));

export const bySlug = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category]));

export { COMPANY_CATEGORIES };
