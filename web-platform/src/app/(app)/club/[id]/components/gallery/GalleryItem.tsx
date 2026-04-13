"use client";

import Image from "next/image";
import { type GalleryMedia } from "./galleryData";

type GalleryItemProps = {
  item: GalleryMedia;
  onSelect: (item: GalleryMedia) => void;
};

export default function GalleryItem({ item, onSelect }: GalleryItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group relative aspect-[4/3] h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="absolute inset-0">
        {item.type === "video" ? (
          <video
            src={item.src}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={item.thumbnailSrc || item.src}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-white">
        <div className="space-y-0.5">
          {item.caption && (
            <p className="line-clamp-2 text-sm font-semibold leading-tight text-white">
              {item.caption}
            </p>
          )}
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            {item.category}
          </p>
        </div>
      </div>
    </button>
  );
}
