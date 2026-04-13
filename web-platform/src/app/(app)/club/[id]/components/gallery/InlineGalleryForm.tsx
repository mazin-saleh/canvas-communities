"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

type GalleryDraft = {
  url: string;
  caption: string;
  category: string;
};

type InlineGalleryFormProps = {
  onSubmit: (draft: GalleryDraft) => Promise<void>;
};

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

export default function InlineGalleryForm({ onSubmit }: InlineGalleryFormProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setCaption("");
    setError(null);
    setOpen(false);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      await onSubmit({ url, caption: caption.trim(), category: "General" });
      reset();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) setFile(dropped);
  };

  // Ghost state
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200 bg-white text-gray-400 transition-colors hover:border-orange-300 hover:text-orange-400"
      >
        <ImagePlus className="h-6 w-6" />
        <span className="text-xs font-medium">Add photo</span>
      </button>
    );
  }

  // Expanded state — same aspect ratio wrapper as GalleryItem
  return (
    <div className="flex aspect-[4/3] w-full flex-col overflow-hidden rounded-md border border-orange-200 bg-white">
      {/* File drop area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 bg-gray-50 transition-colors ${
          file ? "cursor-default" : "hover:bg-orange-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
            e.target.value = "";
          }}
        />
        {file ? (
          <p className="px-2 text-center text-xs font-medium text-gray-600 line-clamp-2">
            {file.name}
          </p>
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-gray-300" />
            <p className="text-[11px] text-gray-400">Click or drop image</p>
          </>
        )}
      </div>

      {/* Caption + actions */}
      <div className="flex flex-col gap-1 border-t border-gray-100 p-1.5">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-[11px] text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-400"
        />
        {error && <p className="text-[10px] text-red-500">{error}</p>}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-0.5 rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 rounded bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
