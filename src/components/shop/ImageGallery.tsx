"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ImageGalleryProps = {
  mainImage: string;
  images: string[];
  productName: string;
};

export function ImageGallery({ mainImage, images, productName }: ImageGalleryProps) {
  const galleryImages = useMemo(() => {
    const uniqueImages = new Set<string>();

    for (const image of [mainImage, ...images]) {
      if (image.trim()) {
        uniqueImages.add(image);
      }
    }

    return [...uniqueImages];
  }, [images, mainImage]);

  const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? "");
  const activeImage = galleryImages.includes(selectedImage) ? selectedImage : (galleryImages[0] ?? "");

  if (!activeImage) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] bg-stone-100 px-8 text-center text-[0.8rem] uppercase tracking-[0.22em] text-ink/45">
        Imagen no disponible
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-100">
        <Image
          key={activeImage}
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(min-width: 1280px) 54vw, (min-width: 1024px) 58vw, 100vw"
          className="object-cover transition-opacity duration-500"
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => {
            const isSelected = image === activeImage;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.2rem] border bg-stone-100 transition sm:h-28 sm:w-24 ${
                  isSelected ? "border-ink shadow-[0_0_0_1px_rgba(26,26,26,0.3)]" : "border-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                aria-pressed={isSelected}
              >
                <Image src={image} alt={`${productName} ${index + 1}`} fill sizes="96px" className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
