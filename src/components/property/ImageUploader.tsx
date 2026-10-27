import { useId } from "react";
import { ImagePlus, X } from "lucide-react";
import { storageService } from "@/services/authService";

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const id = useId();
  const add = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map(storageService.previewFile);
    onChange([...images, ...urls]);
  };
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground hover:border-primary focus-within:border-primary"
      >
        <ImagePlus className="size-6 text-primary" aria-hidden />
        Selecionar imagens (a primeira será a principal)
        <span className="text-xs">Pré-visualização local — nenhuma imagem é enviada a servidor.</span>
        <input id={id} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-md border border-border">
              <img src={src} alt={`Imagem selecionada ${i + 1}`} className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Principal</span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                aria-label={`Remover imagem ${i + 1}`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 hover:bg-destructive"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
