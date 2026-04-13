"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CircleAlert, Upload, X } from "lucide-react";
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
};

function serializeDraft(draft: ClubIdentityDraft): string {
  return JSON.stringify(draft);
}

async function uploadFile(file: File, previousUrl?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (previousUrl) formData.append("previousUrl", previousUrl);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

export default function GeneralInfoForm({ initialValue, readOnly = false, onSave }: GeneralInfoFormProps) {
  const [draft, setDraft] = useState<ClubIdentityDraft>(initialValue);
  const [savedSnapshot, setSavedSnapshot] = useState<ClubIdentityDraft>(initialValue);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {};
    if (!draft.clubName.trim()) e.clubName = "Club name is required.";
    else if (draft.clubName.trim().length > CLUB_NAME_LIMIT) e.clubName = `Max ${CLUB_NAME_LIMIT} characters.`;
    if (!draft.clubDesc.trim()) e.clubDesc = "Description is required.";
    else if (draft.clubDesc.length > DESCRIPTION_LIMIT) e.clubDesc = `Max ${DESCRIPTION_LIMIT} characters.`;
    return e;
  }, [draft]);

  const hasErrors = Boolean(errors.clubName) || Boolean(errors.clubDesc);
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

  const handleLogoUpload = useCallback(async (file: File) => {
    setUploadError(null);
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, draft.avatarUrl || undefined);
      setDraft((c) => ({ ...c, avatarUrl: url }));
    } catch (err: any) {
      setUploadError(err.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }, [draft.avatarUrl]);

  const handleBannerUpload = useCallback(async (file: File) => {
    setUploadError(null);
    setUploadingBanner(true);
    try {
      const url = await uploadFile(file, draft.bannerUrl || undefined);
      setDraft((c) => ({ ...c, bannerUrl: url }));
    } catch (err: any) {
      setUploadError(err.message || "Banner upload failed");
    } finally {
      setUploadingBanner(false);
    }
  }, [draft.bannerUrl]);

  const handleRemoveLogo = () => setDraft((c) => ({ ...c, avatarUrl: "" }));
  const handleRemoveBanner = () => setDraft((c) => ({ ...c, bannerUrl: "" }));

  const handleDrop = (e: React.DragEvent, handler: (file: File) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handler(file);
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
      {/* Upload error toast */}
      {uploadError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <CircleAlert className="h-4 w-4 shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-auto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Section: Club Images */}
      <section className="mb-8 space-y-4">
        <h3 className="text-sm font-semibold text-stone-800">Club Images</h3>

        {/* Logo upload */}
        <div>
          <Label className="mb-1 block text-xs font-medium text-stone-600">Club Logo</Label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-stone-200 bg-stone-100">
              {draft.avatarUrl ? (
                <Image
                  src={draft.avatarUrl}
                  alt="Club logo preview"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-stone-400">
                  {draft.clubName.slice(0, 2).toUpperCase() || "CC"}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={readOnly}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={readOnly || uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingLogo ? "Uploading..." : draft.avatarUrl ? "Replace Logo" : "Upload Logo"}
                </Button>
                {draft.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={readOnly}
                    onClick={handleRemoveLogo}
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-stone-400">JPEG, PNG, GIF, or WebP. Max 5 MB.</p>
            </div>
          </div>
        </div>

        {/* Banner upload */}
        <div>
          <Label className="mb-1 block text-xs font-medium text-stone-600">Club Banner</Label>
          {draft.bannerUrl ? (
            <div className="group relative mb-2 h-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-32">
              <Image
                src={draft.bannerUrl}
                alt="Club banner preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={readOnly || uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={readOnly}
                  onClick={handleRemoveBanner}
                  className="h-8 text-xs text-red-600"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, handleBannerUpload)}
              onClick={() => !readOnly && bannerInputRef.current?.click()}
              className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-orange-400 hover:bg-orange-50/30 sm:h-36"
            >
              <Upload className="h-5 w-5 text-stone-400" />
              <p className="text-xs text-stone-500">
                {uploadingBanner ? "Uploading..." : "Click or drag an image to upload a banner"}
              </p>
              <p className="text-[10px] text-stone-400">Recommended: wide landscape image. Max 5 MB.</p>
            </div>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={readOnly}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBannerUpload(file);
              e.target.value = "";
            }}
          />
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
