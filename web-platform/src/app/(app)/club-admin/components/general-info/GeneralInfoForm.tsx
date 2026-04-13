"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, CircleAlert } from "lucide-react";
import TagManager from "./TagManager";

const DESCRIPTION_LIMIT = 280;
const CLUB_NAME_LIMIT = 70;

export type ClubIdentityDraft = {
  clubName: string;
  clubDesc: string;
  clubTags: string[];
  avatarUrl: string;
  bannerUrl: string;
};

type GeneralInfoFormProps = {
  initialValue: ClubIdentityDraft;
  readOnly?: boolean;
  onSave?: (draft: ClubIdentityDraft) => Promise<void>;
};

type ValidationErrors = {
  clubName?: string;
  clubDesc?: string;
  avatarUrl?: string;
  bannerUrl?: string;
};

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true; // empty is fine
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    new URL(withProtocol);
    return true;
  } catch {
    return false;
  }
}

function serializeDraft(draft: ClubIdentityDraft): string {
  return JSON.stringify(draft);
}

export default function GeneralInfoForm({ initialValue, readOnly = false, onSave }: GeneralInfoFormProps) {
  const [draft, setDraft] = useState<ClubIdentityDraft>(initialValue);
  const [savedSnapshot, setSavedSnapshot] = useState<ClubIdentityDraft>(initialValue);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {};
    if (!draft.clubName.trim()) e.clubName = "Club name is required.";
    else if (draft.clubName.trim().length > CLUB_NAME_LIMIT) e.clubName = `Max ${CLUB_NAME_LIMIT} characters.`;
    if (!draft.clubDesc.trim()) e.clubDesc = "Description is required.";
    else if (draft.clubDesc.length > DESCRIPTION_LIMIT) e.clubDesc = `Max ${DESCRIPTION_LIMIT} characters.`;
    if (draft.avatarUrl.trim() && !isValidUrl(draft.avatarUrl)) e.avatarUrl = "Invalid URL.";
    if (draft.bannerUrl.trim() && !isValidUrl(draft.bannerUrl)) e.bannerUrl = "Invalid URL.";
    return e;
  }, [draft]);

  const hasErrors = Boolean(errors.clubName) || Boolean(errors.clubDesc) || Boolean(errors.avatarUrl) || Boolean(errors.bannerUrl);
  const isDirty = serializeDraft(draft) !== serializeDraft(savedSnapshot);

  const addTag = (tag: string): { ok: boolean; message?: string } => {
    const t = tag.trim();
    if (!t) return { ok: false, message: "Type a category first." };
    if (t.length > 24) return { ok: false, message: "Max 24 characters." };
    if (draft.clubTags.some((x) => x.toLowerCase() === t.toLowerCase())) return { ok: false, message: "Already exists." };
    setDraft((c) => ({ ...c, clubTags: [...c.clubTags, t] }));
    return { ok: true };
  };

  const removeTag = (tag: string) => {
    setDraft((c) => ({ ...c, clubTags: c.clubTags.filter((x) => x !== tag) }));
  };

  const handleSave = async () => {
    if (saving || !isDirty || hasErrors) return;
    setSaving(true);
    const normalizedDraft: ClubIdentityDraft = {
      ...draft,
      clubName: draft.clubName.trim(),
      clubDesc: draft.clubDesc.trim(),
      clubTags: draft.clubTags.map((t) => t.trim()).filter(Boolean),
      avatarUrl: draft.avatarUrl.trim(),
      bannerUrl: draft.bannerUrl.trim(),
    };

    if (onSave) {
      try {
        await onSave(normalizedDraft);
      } catch (e) {
        console.error("[GeneralInfoForm] save failed", e);
        setSaving(false);
        setToastMessage("Failed to save. Please try again.");
        setTimeout(() => setToastMessage(""), 2200);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 650));
    }

    setDraft(normalizedDraft);
    setSavedSnapshot(normalizedDraft);
    setSaving(false);
    setToastMessage("Saved successfully.");
    setTimeout(() => setToastMessage(""), 2200);
  };

  const inputStyle = "h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:border-orange-500";

  return (
    <div className="pb-20">
      {/* Section: Club Images */}
      <section className="mb-8 space-y-4">
        <h3 className="text-sm font-semibold text-stone-800">Club Images</h3>

        <div>
          <Label htmlFor="avatar-url" className="mb-1 block text-xs font-medium text-stone-600">Logo URL</Label>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
              {draft.avatarUrl.trim() ? (
                <Image
                  src={draft.avatarUrl.trim()}
                  alt="Club logo preview"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-stone-400">
                  {draft.clubName.slice(0, 2).toUpperCase() || "CC"}
                </div>
              )}
            </div>
            <Input
              id="avatar-url"
              value={draft.avatarUrl}
              onChange={(e) => setDraft((c) => ({ ...c, avatarUrl: e.target.value }))}
              placeholder="https://example.com/logo.png"
              disabled={readOnly}
              className={[inputStyle, "flex-1", errors.avatarUrl ? "border-red-400" : ""].join(" ")}
            />
          </div>
          {errors.avatarUrl && <p className="mt-0.5 text-xs text-red-600">{errors.avatarUrl}</p>}
          <p className="mt-1 text-xs text-stone-400">Paste a direct link to your club&apos;s logo image.</p>
        </div>

        <div>
          <Label htmlFor="banner-url" className="mb-1 block text-xs font-medium text-stone-600">Banner URL</Label>
          {draft.bannerUrl.trim() && (
            <div className="mb-2 relative h-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-32">
              <Image
                src={draft.bannerUrl.trim()}
                alt="Club banner preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <Input
            id="banner-url"
            value={draft.bannerUrl}
            onChange={(e) => setDraft((c) => ({ ...c, bannerUrl: e.target.value }))}
            placeholder="https://example.com/banner.png"
            disabled={readOnly}
            className={[inputStyle, errors.bannerUrl ? "border-red-400" : ""].join(" ")}
          />
          {errors.bannerUrl && <p className="mt-0.5 text-xs text-red-600">{errors.bannerUrl}</p>}
          <p className="mt-1 text-xs text-stone-400">Paste a direct link to a wide banner image for your club page.</p>
        </div>
      </section>

      {/* Section: Name & Description */}
      <section className="mb-8 space-y-4">
        <div>
          <Label htmlFor="club-name" className="mb-1 block text-sm font-semibold text-stone-800">Club Name</Label>
          <Input
            id="club-name"
            value={draft.clubName}
            onChange={(e) => setDraft((c) => ({ ...c, clubName: e.target.value }))}
            maxLength={CLUB_NAME_LIMIT + 10}
            disabled={readOnly}
            className={inputStyle}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.clubName ? <p className="text-xs text-red-600">{errors.clubName}</p> : <span />}
            <p className="text-xs text-stone-400">{draft.clubName.length}/{CLUB_NAME_LIMIT}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="club-desc" className="mb-1 block text-sm font-semibold text-stone-800">Description</Label>
          <Textarea
            id="club-desc"
            value={draft.clubDesc}
            onChange={(e) => setDraft((c) => ({ ...c, clubDesc: e.target.value }))}
            maxLength={DESCRIPTION_LIMIT + 40}
            rows={4}
            disabled={readOnly}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:border-orange-500"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.clubDesc ? <p className="text-xs text-red-600">{errors.clubDesc}</p> : <span />}
            <p className="text-xs text-stone-400">{draft.clubDesc.length}/{DESCRIPTION_LIMIT}</p>
          </div>
        </div>
      </section>

      {/* Section: Tags */}
      <section className="mb-8">
        <h3 className="mb-1 text-sm font-semibold text-stone-800">Categories</h3>
        <p className="mb-2 text-xs text-stone-500">Tags help students discover your club.</p>
        <TagManager tags={draft.clubTags} onAddTag={addTag} onRemoveTag={removeTag} />
      </section>

      {/* Sticky save bar */}
      {!readOnly && (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
              {hasErrors ? (
                <><CircleAlert className="h-3.5 w-3.5 text-red-500" /> Fix errors before saving</>
              ) : isDirty ? (
                <><CircleAlert className="h-3.5 w-3.5 text-amber-500" /> Unsaved changes</>
              ) : (
                <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Up to date</>
              )}
            </span>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || hasErrors || !isDirty}
              className="h-9 rounded-md bg-orange-600 px-5 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
