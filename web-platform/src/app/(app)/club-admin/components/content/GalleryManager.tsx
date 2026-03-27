"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type GalleryDraft } from "./types";

const initialGallery: GalleryDraft[] = [
  {
    id: "gal-admin-001",
    src: "/gator-hero.png",
    type: "image",
    category: "Community",
    alt: "Club community event banner",
    caption: "Community showcase kickoff",
  },
  {
    id: "gal-admin-002",
    src: "/background.png",
    type: "image",
    category: "Campus",
    alt: "Campus scene background used for club promotions",
    caption: "Campus afternoon social",
  },
];

export default function GalleryManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<GalleryDraft[]>(initialGallery);

  const outputPayload = useMemo(() => items, [items]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const uploads: GalleryDraft[] = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `gal-admin-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        src: URL.createObjectURL(file),
        type: "image",
        category: "Uncategorized",
        alt: "",
        caption: "",
      }));

    if (uploads.length > 0) {
      setItems((current) => [...uploads, ...current]);
    }

    event.target.value = "";
  };

  const update = (id: string, patch: Partial<GalleryDraft>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const remove = (id: string) => {
    const approved = window.confirm("Delete this gallery item?");
    if (!approved) return;
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Upload images, edit alt text, and curate public gallery cards.
        </p>
        <Button
          type="button"
          onClick={openFilePicker}
          className="h-[40px] rounded-[5px] bg-[#354a9c] text-white hover:bg-[#2e448b]"
        >
          Upload Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="space-y-2 rounded-lg border border-[var(--admin-border)] bg-white p-2"
          >
            <div className="relative h-32 overflow-hidden rounded border border-gray-200 bg-slate-50">
              <Image
                src={item.src}
                alt={item.alt || "Gallery image preview"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <Input
              value={item.alt}
              onChange={(event) => update(item.id, { alt: event.target.value })}
              placeholder="Alt text (required for accessibility)"
              className="h-[38px] rounded-[5px] border-[#c8c8c8] text-xs"
            />
            <Input
              value={item.category}
              onChange={(event) =>
                update(item.id, { category: event.target.value })
              }
              placeholder="Category"
              className="h-[38px] rounded-[5px] border-[#c8c8c8] text-xs"
            />
            <Input
              value={item.caption || ""}
              onChange={(event) =>
                update(item.id, { caption: event.target.value })
              }
              placeholder="Caption (optional)"
              className="h-[38px] rounded-[5px] border-[#c8c8c8] text-xs"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => remove(item.id)}
              className="h-[36px] w-full rounded-[5px] border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              Delete
            </Button>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3">
        <h4 className="text-sm font-semibold text-slate-900">Gallery JSON Output</h4>
        <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs text-slate-700">
          {JSON.stringify(outputPayload, null, 2)}
        </pre>
      </section>
    </div>
  );
}
