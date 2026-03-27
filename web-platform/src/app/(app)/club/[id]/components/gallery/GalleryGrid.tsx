"use client";

import { useMemo, useState } from "react";
import GalleryItem from "./GalleryItem";
import GalleryLightbox from "./GalleryLightbox";
import { type GalleryMedia } from "./galleryData";

type GalleryGridProps = {
  items: GalleryMedia[];
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<GalleryMedia | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const visibleItems = useMemo(() => {
    if (selectedCategory === "All") {
      return items;
    }

    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <section className="mt-2 rounded-lg border border-gray-300 bg-[#f7f7f7] p-2">
      <div className="mb-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedCategory === category ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3">
        {visibleItems.map((item) => (
          <GalleryItem key={item.id} item={item} onSelect={setSelectedItem} />
        ))}
      </div>

      {visibleItems.length === 0 && (
        <p className="p-2 text-sm text-gray-500">No gallery media found for this category.</p>
      )}

      <GalleryLightbox
        item={selectedItem}
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
          }
        }}
      />
    </section>
  );
}
