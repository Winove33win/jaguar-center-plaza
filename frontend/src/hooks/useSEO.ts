import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function useSEO({ title, description, canonical, robots = 'index,follow', jsonLd }: SEOOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.setAttribute('name', 'description');
        document.head.appendChild(descriptionMeta);
      }
      descriptionMeta.setAttribute('content', description);
    }

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', robots);

    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    const existingJsonLd = document.querySelectorAll('script[data-managed="seo-json-ld"]');
    existingJsonLd.forEach((element) => element.remove());

    if (jsonLd) {
      const entries = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const entry of entries) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-managed', 'seo-json-ld');
        script.textContent = JSON.stringify(entry);
        document.head.appendChild(script);
      }
    }
  }, [title, description, canonical, robots, jsonLd]);
}
