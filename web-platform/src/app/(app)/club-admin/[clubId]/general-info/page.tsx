"use client";

import { useClubAdmin } from "../ClubAdminContext";
import GeneralInfoForm, { type ClubIdentityDraft } from "../../components/general-info/GeneralInfoForm";

export default function ClubGeneralInfoPage() {
  const { club, loading, isOwner, userPermissions, actions } = useClubAdmin();

  if (loading || !club) {
    return <p className="text-sm text-slate-500">Loading club info...</p>;
  }

  const canEdit = isOwner || userPermissions.includes("canManageSettings");

  const initialValue: ClubIdentityDraft = {
    clubName: club.name,
    bannerSrc: "/background.png",
    clubDesc: club.description,
    clubTags: club.tags.map(t => t.name),
    socialLinks: [
      { platform: "Website", href: "" },
      { platform: "Instagram", href: "" },
      { platform: "LinkedIn", href: "" },
      { platform: "Discord", href: "" },
    ],
  };

  return (
    <GeneralInfoForm
      initialValue={initialValue}
      readOnly={!canEdit}
      onSave={async (draft) => {
        await actions.updateClub({
          name: draft.clubName,
          description: draft.clubDesc,
        });
      }}
    />
  );
}
