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
      className="group overflow-hidden rounded-md border border-gray-300 bg-white text-left"
    >
      <div className="relative h-28 w-full sm:h-32 lg:h-36">
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
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        )}
      </div>

      {(item.caption || item.category) && (
        <div className="px-2 py-1.5">
          {item.caption && (
            <p className="line-clamp-1 text-xs font-medium text-gray-800">{item.caption}</p>
          )}
          <p className="text-[10px] text-gray-500">{item.category}</p>
        </div>
      )}
    </button>
  );
}
