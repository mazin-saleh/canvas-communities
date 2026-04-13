"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type GalleryMedia } from "./galleryData";

type GalleryLightboxProps = {
  item: GalleryMedia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function GalleryLightbox({
  item,
  open,
  onOpenChange,
}: GalleryLightboxProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-gray-300 bg-white p-4">
        <DialogTitle className="sr-only">{item.alt}</DialogTitle>

        <div className="flex aspect-[16/10] max-h-[70vh] items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-950">
          {item.type === "video" ? (
            <video
              src={item.src}
              controls
              preload="metadata"
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src={item.src}
              alt={item.alt}
              width={1600}
              height={900}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          )}
        </div>

        {item.caption && (
          <p className="text-sm text-gray-600">{item.caption}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
