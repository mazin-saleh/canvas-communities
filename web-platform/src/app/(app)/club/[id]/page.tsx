import dynamic from "next/dynamic";
import { mockClubs } from "@/mocks/clubs";
import { mockEvents } from "@/mocks/events";

const ClubPageClient = dynamic(() => import("./ClubPageClient"), {
  ssr: false,
});

export default function ClubPage({ params }: { params: { id: string } }) {
  const club = mockClubs.find((c) => c.id === params.id) || mockClubs[0];
  const events = mockEvents.filter((e) => e.clubId === club.id);

  return <ClubPageClient club={club} events={events} />;
}
