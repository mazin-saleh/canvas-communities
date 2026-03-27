"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type TagManagerProps = {
  tags: string[];
  onAddTag: (tag: string) => { ok: boolean; message?: string };
  onRemoveTag: (tag: string) => void;
};

export default function TagManager({ tags, onAddTag, onRemoveTag }: TagManagerProps) {
  const [pendingTag, setPendingTag] = useState("");
  const [inlineError, setInlineError] = useState("");

  const submitTag = () => {
    const result = onAddTag(pendingTag);
    if (!result.ok) {
      setInlineError(result.message || "Unable to add tag.");
      return;
    }

    setPendingTag("");
    setInlineError("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs text-slate-500">No categories yet. Add one below.</p>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-brand-orange)] bg-[var(--admin-brand-orange-soft)] px-2 py-1 text-xs font-medium text-[var(--admin-brand-orange)]"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onRemoveTag(tag)}
                className="rounded-full p-0.5 text-[var(--admin-brand-orange)] hover:bg-white/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={pendingTag}
          onChange={(event) => {
            setPendingTag(event.target.value);
            if (inlineError) {
              setInlineError("");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitTag();
            }
          }}
          placeholder="Type category and press Enter"
          className="h-[44px] rounded-[5px] border border-[#c8c8c8] bg-white px-3 text-sm text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]"
        />
        <Button
          type="button"
          onClick={submitTag}
          className="h-[44px] rounded-[5px] bg-[#354a9c] px-5 text-white hover:bg-[#2e448b]"
        >
          Add Tag
        </Button>
      </div>

      {inlineError ? <p className="text-xs text-rose-600">{inlineError}</p> : null}
    </div>
  );
}
