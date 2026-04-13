"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import GalleryItem from "./GalleryItem";
import GalleryLightbox from "./GalleryLightbox";
import InlineGalleryForm from "./InlineGalleryForm";
import { type GalleryMedia } from "./galleryData";

type GalleryDraft = {
  url: string;
  caption: string;
  category: string;
};

type GalleryGridProps = {
  items: GalleryMedia[];
  canDelete?: boolean;
  onCreate?: (draft: GalleryDraft) => Promise<void>;
  onDelete?: (id: string) => void;
};

export default function GalleryGrid({
  items,
  canDelete,
  onCreate,
  onDelete,
}: GalleryGridProps) {
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
    <section className="mt-2 flex h-[70vh] max-h-[48rem] flex-col overflow-hidden rounded-lg border border-gray-300 bg-[#f7f7f7] p-2">
      <div className="mb-2 flex flex-wrap gap-2 shrink-0">
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

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Inline add form — first cell, admin only */}
          {canDelete && onCreate && <InlineGalleryForm onSubmit={onCreate} />}

          {visibleItems.map((item) => (
            <div key={item.id} className="group relative h-full">
              <GalleryItem item={item} onSelect={setSelectedItem} />
              {canDelete && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {visibleItems.length === 0 && !canDelete && (
          <p className="p-2 text-sm text-gray-500">
            No gallery media found for this category.
          </p>
        )}
      </div>

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
