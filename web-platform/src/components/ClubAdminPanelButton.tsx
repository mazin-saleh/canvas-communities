"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useRole } from "@/context/RoleContext";

type ClubAdminPanelButtonProps = {
  clubId: string | number;
};

export default function ClubAdminPanelButton({ clubId }: ClubAdminPanelButtonProps) {
  const { hydrated, loading, isClubOwnerOrAdmin } = useRole();

  const normalizedClubId = Number(clubId);
  const isValidClubId = Number.isInteger(normalizedClubId) && normalizedClubId > 0;

  if (!hydrated || loading || !isValidClubId || !isClubOwnerOrAdmin(normalizedClubId)) {
    return null;
  }

  return (
    <Link
      href={`/club-admin/${normalizedClubId}`}
      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-white"
    >
      <Shield className="h-4 w-4" />
      Admin Panel
    </Link>
  );
}
