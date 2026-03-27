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
  const url = new URL(withProtocol);

  return url.toString();
}

function serializeDraft(draft: ClubIdentityDraft): string {
  return JSON.stringify(draft);
}

export default function GeneralInfoForm({ initialValue }: GeneralInfoFormProps) {
  const [draft, setDraft] = useState<ClubIdentityDraft>(initialValue);
  const [savedSnapshot, setSavedSnapshot] = useState<ClubIdentityDraft>(initialValue);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const uploadedBannerRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedBannerRef.current) {
        URL.revokeObjectURL(uploadedBannerRef.current);
      }
    };
  }, []);

  const errors = useMemo<ValidationErrors>(() => {
    const nextErrors: ValidationErrors = { socialLinks: {} };

    if (!draft.clubName.trim()) {
      nextErrors.clubName = "Club name is required.";
    } else if (draft.clubName.trim().length > CLUB_NAME_LIMIT) {
      nextErrors.clubName = `Club name must be ${CLUB_NAME_LIMIT} characters or less.`;
    }

    if (!draft.clubDesc.trim()) {
      nextErrors.clubDesc = "Description is required.";
    } else if (draft.clubDesc.length > DESCRIPTION_LIMIT) {
      nextErrors.clubDesc = `Description must be ${DESCRIPTION_LIMIT} characters or less.`;
    }

    draft.socialLinks.forEach((socialLink) => {
      if (!socialLink.href.trim()) {
        return;
      }

      try {
        normalizeUrl(socialLink.href);
      } catch {
        nextErrors.socialLinks[socialLink.platform] = "Enter a valid URL (example.com or https://example.com).";
      }
    });

    return nextErrors;
  }, [draft]);

  const hasErrors =
    Boolean(errors.clubName) ||
    Boolean(errors.clubDesc) ||
    Object.values(errors.socialLinks).some(Boolean);

  const isDirty = serializeDraft(draft) !== serializeDraft(savedSnapshot);

  const updateSocialLink = (platform: SocialPlatform, href: string) => {
    setDraft((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((socialLink) =>
        socialLink.platform === platform ? { ...socialLink, href } : socialLink,
      ),
    }));
  };

  const addTag = (tag: string): { ok: boolean; message?: string } => {
    const normalizedTag = tag.trim();

    if (!normalizedTag) {
      return { ok: false, message: "Type a category first." };
    }

    if (normalizedTag.length > 24) {
      return { ok: false, message: "Categories must be 24 characters or less." };
    }

    const alreadyExists = draft.clubTags.some(
      (existingTag) => existingTag.toLowerCase() === normalizedTag.toLowerCase(),
    );

    if (alreadyExists) {
      return { ok: false, message: "That category already exists." };
    }

    setDraft((current) => ({ ...current, clubTags: [...current.clubTags, normalizedTag] }));
    return { ok: true };
  };

  const removeTag = (tag: string) => {
    setDraft((current) => ({
      ...current,
      clubTags: current.clubTags.filter((existingTag) => existingTag !== tag),
    }));
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (uploadedBannerRef.current) {
      URL.revokeObjectURL(uploadedBannerRef.current);
    }
    uploadedBannerRef.current = objectUrl;

    setDraft((current) => ({
      ...current,
      bannerSrc: objectUrl,
    }));

    event.currentTarget.value = "";
  };

  const handleSave = async () => {
    if (saving || !isDirty || hasErrors) {
      return;
    }

    setSaving(true);

    const normalizedDraft: ClubIdentityDraft = {
      ...draft,
      clubName: draft.clubName.trim(),
      clubDesc: draft.clubDesc.trim(),
      clubTags: draft.clubTags.map((tag) => tag.trim()).filter(Boolean),
      socialLinks: draft.socialLinks.map((socialLink) => ({
        ...socialLink,
        href: socialLink.href.trim() ? normalizeUrl(socialLink.href) : "",
      })),
    };

    await new Promise((resolve) => setTimeout(resolve, 650));

    setDraft(normalizedDraft);
    setSavedSnapshot(normalizedDraft);
    setSaving(false);
    setToastMessage("General Info saved successfully.");

    setTimeout(() => {
      setToastMessage("");
    }, 2200);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">General Info</h2>
          <p className="text-sm text-slate-600">
            Edit the core identity shown in your public club profile.
          </p>
        </div>

        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isDirty
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800",
          ].join(" ")}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {isDirty ? "Unsaved Changes" : "All Changes Saved"}
        </span>
      </div>

      <section className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">Club Banner</Label>
          <div className="relative h-36 overflow-hidden rounded-xl border border-[#c8c8c8] bg-slate-100 sm:h-44">
            <Image
              src={draft.bannerSrc || "/background.png"}
              alt={`${draft.clubName || "Club"} banner preview`}
              fill
              sizes="(max-width: 640px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#c8c8c8] bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Upload New Banner
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </label>
          <p className="text-xs text-slate-500">
            Use a wide image for best results. This banner is displayed on the public club page.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-name" className="text-sm font-semibold text-slate-900">
            Club Name
          </Label>
          <Input
            id="club-name"
            value={draft.clubName}
            onChange={(event) => setDraft((current) => ({ ...current, clubName: event.target.value }))}
            maxLength={CLUB_NAME_LIMIT + 10}
            className="h-[44px] rounded-[5px] border border-[#c8c8c8] bg-white px-3 text-base text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]"
          />
          <div className="flex items-center justify-between">
            {errors.clubName ? <p className="text-xs text-rose-600">{errors.clubName}</p> : <span />}
            <p className="text-xs text-slate-500">{draft.clubName.length}/{CLUB_NAME_LIMIT}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-desc" className="text-sm font-semibold text-slate-900">
            Description
          </Label>
          <Textarea
            id="club-desc"
            value={draft.clubDesc}
            onChange={(event) => setDraft((current) => ({ ...current, clubDesc: event.target.value }))}
            maxLength={DESCRIPTION_LIMIT + 40}
            rows={5}
            className="rounded-[5px] border border-[#c8c8c8] bg-white px-3 py-2 text-base text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]"
          />
          <div className="flex items-center justify-between">
            {errors.clubDesc ? <p className="text-xs text-rose-600">{errors.clubDesc}</p> : <span />}
            <p className="text-xs text-slate-500">{draft.clubDesc.length}/{DESCRIPTION_LIMIT}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-900">Categories (Tags)</Label>
          <TagManager tags={draft.clubTags} onAddTag={addTag} onRemoveTag={removeTag} />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">Social Links</Label>
          <div className="grid gap-3">
            {draft.socialLinks.map((socialLink) => (
              <div key={socialLink.platform} className="space-y-1">
                <Label
                  htmlFor={`social-${socialLink.platform.toLowerCase()}`}
                  className="text-xs font-medium text-slate-700"
                >
                  {socialLink.platform}
                </Label>
                <Input
                  id={`social-${socialLink.platform.toLowerCase()}`}
                  value={socialLink.href}
                  onChange={(event) => updateSocialLink(socialLink.platform, event.target.value)}
                  placeholder="example.com/yourclub"
                  className={[
                    "h-[44px] rounded-[5px] border bg-white px-3 text-sm text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]",
                    errors.socialLinks[socialLink.platform] ? "border-rose-300" : "border-[#c8c8c8]",
                  ].join(" ")}
                />
                {errors.socialLinks[socialLink.platform] ? (
                  <p className="text-xs text-rose-600">{errors.socialLinks[socialLink.platform]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[var(--admin-border)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-slate-600">
            {hasErrors ? (
              <>
                <CircleAlert className="h-4 w-4 text-rose-500" />
                Resolve validation issues before saving.
              </>
            ) : isDirty ? (
              <>
                <CircleAlert className="h-4 w-4 text-amber-500" />
                You have unsaved changes.
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Everything is up to date.
              </>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || hasErrors || !isDirty}
            className="h-[44px] rounded-[5px] bg-[#354a9c] px-6 text-sm font-semibold text-white hover:bg-[#2e448b] disabled:bg-slate-300"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-5 z-50 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow"
        >
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}
