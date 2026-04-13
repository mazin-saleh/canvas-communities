import { redirect } from "next/navigation";

type ClubAdminIndexPageProps = {
  params: Promise<{ clubId: string }>;
};

export default async function ClubAdminIndexPage({ params }: ClubAdminIndexPageProps) {
  const { clubId } = await params;
  redirect(`/club-admin/${clubId}/general-info`);
}
