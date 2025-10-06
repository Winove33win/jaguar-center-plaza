import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

export type ImageGalleryCarouselProps = {
  images?: string[];
  title?: string | null;
  autoAdvance?: boolean;
  autoAdvanceInterval?: number;
};

const FALLBACK_INTERVAL = 7000;

export default function ImageGalleryCarousel({
  images,
  title,
  autoAdvance = false,
  autoAdvanceInterval = FALLBACK_INTERVAL
}: ImageGalleryCarouselProps) {
  const galleryItems = useMemo(() => {
    if (!Array.isArray(images)) {
      return [] as string[];
    }

    const normalized = images
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);

    const unique = Array.from(new Set(normalized));
    return unique;
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= galleryItems.length) {
      setCurrentIndex((value) => (galleryItems.length > 0 ? Math.max(0, galleryItems.length - 1) : value));
    }
  }, [currentIndex, galleryItems.length]);

  useEffect(() => {
    if (!autoAdvance || galleryItems.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((value) => (value + 1) % galleryItems.length);
    }, Math.max(3000, autoAdvanceInterval));

    return () => window.clearInterval(interval);
  }, [autoAdvance, autoAdvanceInterval, galleryItems.length]);

  if (galleryItems.length === 0) {
    return null;
  }

  const goTo = (index: number) => {
    setCurrentIndex((value) => {
      if (Number.isNaN(index)) {
        return value;
      }
      const safeIndex = Math.min(Math.max(index, 0), galleryItems.length - 1);
      return safeIndex;
    });
  };

  const goNext = () => {
    setCurrentIndex((value) => (value + 1) % galleryItems.length);
  };

  const goPrevious = () => {
    setCurrentIndex((value) => (value - 1 + galleryItems.length) % galleryItems.length);
  };

  const primaryAlt = title ? `Galeria de imagens da empresa ${title}` : 'Galeria de imagens da empresa';

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-primary-900/5">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {galleryItems.map((imageSrc, index) => (
            <div
              key={imageSrc}
              className="relative aspect-[16/10] min-w-full bg-gradient-to-br from-primary-900/10 via-primary-900/5 to-accent-500/5"
            >
              <img
                src={imageSrc}
                alt={index === currentIndex ? primaryAlt : `${primaryAlt} - imagem ${index + 1}`}
                className="h-full w-full object-cover"
                loading={index === currentIndex ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {galleryItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary-800 shadow-lg transition hover:bg-white"
              aria-label="Imagem anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary-800 shadow-lg transition hover:bg-white"
              aria-label="Próxima imagem"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {galleryItems.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {galleryItems.map((imageSrc, index) => (
            <button
              key={`${imageSrc}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={clsx(
                'group relative h-20 w-28 overflow-hidden rounded-xl border-2 transition focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-white',
                index === currentIndex ? 'border-accent-500 shadow-lg' : 'border-transparent hover:border-accent-200'
              )}
              aria-label={`Ir para imagem ${index + 1}`}
            >
              <img
                src={imageSrc}
                alt={`${primaryAlt} - miniatura ${index + 1}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
              {index === currentIndex && <span className="absolute inset-0 ring-2 ring-inset ring-accent-500" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M12.78 4.22a.75.75 0 010 1.06L8.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M7.22 4.22a.75.75 0 011.06 0L13.53 9.47a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
