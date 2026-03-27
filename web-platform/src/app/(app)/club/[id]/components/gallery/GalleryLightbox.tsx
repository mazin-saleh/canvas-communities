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

        <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {item.type === "video" ? (
            <video
              src={item.src}
              controls
              preload="metadata"
              className="h-auto w-full object-cover"
            />
          ) : (
            <Image
              src={item.src}
              alt={item.alt}
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
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
