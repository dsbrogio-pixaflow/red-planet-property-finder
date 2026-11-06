
import { useState } from "react";
import { cn } from "@/lib/utils";
import fallbackImage from "@/assets/olympus.jpg";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  const current = images[active] ?? fallbackImage;

  function handleImageError(
    event: React.SyntheticEvent<HTMLImageElement>
  ) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackImage;
  }

  return (
    <div className="space-y-3">

      <div className="aspect-[16/10] overflow-hidden rounded-xl border border-border/60 bg-muted">
        <img
          src={current}
          alt={`${title} — foto ${active + 1}`}
          onError={handleImageError}
          className="size-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Mostrar foto ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "aspect-[4/3] overflow-hidden rounded-md border-2 transition-opacity",
                i === active
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={handleImageError}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
