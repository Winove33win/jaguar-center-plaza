export function ensureAbsoluteUrl(url, baseUrl) {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url, baseUrl || undefined);
    return parsed.toString();
  } catch (error) {
    if (!baseUrl) {
      return url;
    }

    try {
      const fallback = new URL(url.replace(/^\/+/, ''), `${baseUrl}/`);
      return fallback.toString();
    } catch (_) {
      return url;
    }
  }
}

export function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  return [value];
}
