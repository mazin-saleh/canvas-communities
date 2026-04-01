"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, CircleAlert, Upload } from "lucide-react";
import TagManager from "./TagManager";

const DESCRIPTION_LIMIT = 280;
const CLUB_NAME_LIMIT = 70;

type SocialPlatform = "Website" | "Instagram" | "LinkedIn" | "Discord";

type SocialLinkField = {
  platform: SocialPlatform;
  href: string;
};

export type ClubIdentityDraft = {
  clubName: string;
  bannerSrc: string;
  clubDesc: string;
  clubTags: string[];
  socialLinks: SocialLinkField[];
};

type GeneralInfoFormProps = {
  initialValue: ClubIdentityDraft;
  readOnly?: boolean;
  onSave?: (draft: ClubIdentityDraft) => Promise<void>;
};

type ValidationErrors = {
  clubName?: string;
  clubDesc?: string;
  socialLinks: Partial<Record<SocialPlatform, string>>;
};

function normalizeUrl(rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).toString();
}

function serializeDraft(draft: ClubIdentityDraft): string {
  return JSON.stringify(draft);
}

export default function GeneralInfoForm({ initialValue, readOnly = false, onSave }: GeneralInfoFormProps) {
  const [draft, setDraft] = useState<ClubIdentityDraft>(initialValue);
  const [savedSnapshot, setSavedSnapshot] = useState<ClubIdentityDraft>(initialValue);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const uploadedBannerRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedBannerRef.current) URL.revokeObjectURL(uploadedBannerRef.current);
    };
  }, []);

  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = { socialLinks: {} };
    if (!draft.clubName.trim()) e.clubName = "Club name is required.";
    else if (draft.clubName.trim().length > CLUB_NAME_LIMIT) e.clubName = `Max ${CLUB_NAME_LIMIT} characters.`;
    if (!draft.clubDesc.trim()) e.clubDesc = "Description is required.";
    else if (draft.clubDesc.length > DESCRIPTION_LIMIT) e.clubDesc = `Max ${DESCRIPTION_LIMIT} characters.`;
    draft.socialLinks.forEach((sl) => {
      if (!sl.href.trim()) return;
      try { normalizeUrl(sl.href); } catch { e.socialLinks[sl.platform] = "Invalid URL."; }
    });
    return e;
  }, [draft]);

  const hasErrors = Boolean(errors.clubName) || Boolean(errors.clubDesc) || Object.values(errors.socialLinks).some(Boolean);
  const isDirty = serializeDraft(draft) !== serializeDraft(savedSnapshot);

  const updateSocialLink = (platform: SocialPlatform, href: string) => {
    setDraft((c) => ({ ...c, socialLinks: c.socialLinks.map((sl) => sl.platform === platform ? { ...sl, href } : sl) }));
  };

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

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    if (uploadedBannerRef.current) URL.revokeObjectURL(uploadedBannerRef.current);
    uploadedBannerRef.current = objectUrl;
    setDraft((c) => ({ ...c, bannerSrc: objectUrl }));
    event.currentTarget.value = "";
  };

  const handleSave = async () => {
    if (saving || !isDirty || hasErrors) return;
    setSaving(true);
    const normalizedDraft: ClubIdentityDraft = {
      ...draft,
      clubName: draft.clubName.trim(),
      clubDesc: draft.clubDesc.trim(),
      clubTags: draft.clubTags.map((t) => t.trim()).filter(Boolean),
      socialLinks: draft.socialLinks.map((sl) => ({ ...sl, href: sl.href.trim() ? normalizeUrl(sl.href) : "" })),
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
      {/* Section: Banner */}
      <section className="mb-8">
        <h3 className="mb-1 text-sm font-semibold text-stone-800">Club Banner</h3>
        <p className="mb-3 text-xs text-stone-500">Use a wide image. Displayed on the public club page.</p>
        <div className="relative h-32 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-40">
          <Image
            src={draft.bannerSrc || "/background.png"}
            alt={`${draft.clubName || "Club"} banner`}
            fill
            sizes="(max-width: 640px) 100vw, 720px"
            className="object-cover"
          />
        </div>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50">
          <Upload className="h-3.5 w-3.5" />
          Upload Banner
          <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
        </label>
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

      {/* Section: Social Links */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-stone-800">Social Links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {draft.socialLinks.map((sl) => (
            <div key={sl.platform}>
              <Label htmlFor={`social-${sl.platform.toLowerCase()}`} className="mb-1 block text-xs font-medium text-stone-600">
                {sl.platform}
              </Label>
              <Input
                id={`social-${sl.platform.toLowerCase()}`}
                value={sl.href}
                onChange={(e) => updateSocialLink(sl.platform, e.target.value)}
                placeholder="example.com/yourclub"
                disabled={readOnly}
                className={[inputStyle, errors.socialLinks[sl.platform] ? "border-red-400" : ""].join(" ")}
              />
              {errors.socialLinks[sl.platform] && <p className="mt-0.5 text-xs text-red-600">{errors.socialLinks[sl.platform]}</p>}
            </div>
          ))}
        </div>
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
