"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CreateCommunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void;
};

export default function CreateCommunityDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateCommunityDialogProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    tags: [],
    email: "",
    logo: null as File | null,
    banner: null as File | null,
  });
  const [assetError, setAssetError] = useState<string | null>(null);

  const hasRequiredAssets = Boolean(form.logo && form.banner);

  const handleSubmit = () => {
    if (!hasRequiredAssets) {
      setAssetError("Please upload both a logo and a banner before creating.");
      return;
    }

    setAssetError(null);

    // TODO: Replace with real API call
    console.log("Create community:", form);

    onSubmit?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-stone-200 bg-white p-0 shadow-2xl sm:rounded-2xl">
        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader className="border-b border-stone-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-semibold text-stone-900">
              Create a Community
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-500">
              Set up your club&apos;s profile and presence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="space-y-2">
              <Label>Community Name</Label>
              <Input
                placeholder="e.g. Robotics Club"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea
                placeholder="Brief description of your club..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Category / Tags</Label>
              <Input placeholder="Select tags (API-driven later)" />
            </div>

            <div className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
              <h2 className="text-sm font-medium text-stone-500">
                Required Media Assets
              </h2>

              <div className="space-y-2">
                <Label>Upload Logo *</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white">
                    <Upload className="h-6 w-6 text-stone-400" />
                  </div>
                  <div className="space-y-1">
                    <input
                      id="community-logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setForm({ ...form, logo: file });
                        if (file && form.banner) setAssetError(null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="text-white hover:text-stone-900"
                      onClick={() =>
                        document.getElementById("community-logo-upload")?.click()
                      }
                    >
                      Choose Logo
                    </Button>
                    <p className="text-xs text-stone-500">
                      {form.logo ? form.logo.name : "No logo selected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Banner *</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-28 items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white">
                    <Upload className="h-6 w-6 text-stone-400" />
                  </div>
                  <div className="space-y-1">
                    <input
                      id="community-banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setForm({ ...form, banner: file });
                        if (form.logo && file) setAssetError(null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("community-banner-upload")?.click()
                      }
                    >
                      Choose Banner
                    </Button>
                    <p className="text-xs text-stone-500">
                      {form.banner ? form.banner.name : "No banner selected"}
                    </p>
                  </div>
                </div>
              </div>

              {assetError && (
                <p className="text-xs font-medium text-red-600">{assetError}</p>
              )}

              <div className="space-y-2">
                <Label>Primary Contact Email</Label>
                <Input
                  type="email"
                  placeholder="contact@club.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-stone-100 bg-stone-50/60 px-6 py-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!hasRequiredAssets}>
              Create Community
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
