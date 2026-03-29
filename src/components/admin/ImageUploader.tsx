"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

type ImageUploaderProps = {
  label: string;
  buttonLabel: string;
  hint: string;
  value: string[];
  multiple?: boolean;
  disabled?: boolean;
  onChange: (images: string[]) => void;
};

export function ImageUploader({
  label,
  buttonLabel,
  hint,
  value,
  multiple = false,
  disabled = false,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as string[] | { error?: string; urls?: string[] };

      if (!response.ok) {
        const message = Array.isArray(result) ? "No se pudieron subir las imágenes." : (result.error ?? "No se pudieron subir las imágenes.");
        throw new Error(message);
      }

      const uploadedImages = Array.isArray(result) ? result : (result.urls ?? []);
      const nextImages = multiple ? [...value, ...uploadedImages] : uploadedImages.slice(0, 1);

      onChange(nextImages);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudieron subir las imágenes.");
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleRemoveImage(indexToRemove: number) {
    onChange(value.filter((_, index) => index !== indexToRemove));
  }

  function moveImage(fromIndex: number, toIndex: number) {
    const nextImages = [...value];
    const [movedImage] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, movedImage);
    onChange(nextImages);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="text-sm font-medium text-zinc-900">{label}</label>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Subiendo..." : buttonLabel}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelection}
        disabled={disabled || isUploading}
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      {value.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {value.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              draggable={multiple && !disabled}
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(event) => {
                if (multiple) {
                  event.preventDefault();
                }
              }}
              onDrop={() => {
                if (multiple && draggingIndex !== null && draggingIndex !== index) {
                  moveImage(draggingIndex, index);
                }

                setDraggingIndex(null);
              }}
              onDragEnd={() => setDraggingIndex(null)}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100"
            >
              <div className="relative aspect-square">
                <Image src={imageUrl} alt="Imagen subida" fill className="object-cover" sizes="160px" />
              </div>

              {multiple ? (
                <div className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700 shadow-sm">
                  {index + 1}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/85 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Eliminar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center text-sm leading-6 text-zinc-500">
          Todavía no subiste imágenes. Podés cargar archivos JPG, PNG o WEBP de hasta 5 MB.
        </div>
      )}

      {multiple && value.length > 1 ? (
        <p className="text-xs leading-5 text-zinc-500">Arrastrá las miniaturas para cambiar el orden de las imágenes adicionales.</p>
      ) : null}
    </div>
  );
}
