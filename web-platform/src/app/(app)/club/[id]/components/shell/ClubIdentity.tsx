import Image from "next/image";
import { Button } from "@/components/ui/button";
import TagList from "./TagList";

type ClubIdentityProps = {
  logoSrc: string;
  clubName: string;
  clubDesc: string;
  clubTags: Array<string | { name?: string }>;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
};

export default function ClubIdentity({
  logoSrc,
  clubName,
  clubDesc,
  clubTags,
  joined,
  joining,
  onJoin,
}: ClubIdentityProps) {
  return (
    <section className="relative z-10">
      <div className="-mt-16 mb-4 h-20 w-20 overflow-hidden rounded-xl border-2 border-white bg-[#0f2d6b] shadow-sm sm:-mt-20 sm:h-24 sm:w-24 lg:-mt-24">
        <Image
          src={logoSrc}
          alt={clubName}
          width={96}
          height={96}
          className="h-full w-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-semibold leading-tight text-black sm:text-3xl lg:text-5xl">
        {clubName}
      </h1>
      <p className="mt-4 text-[13px] leading-5 text-gray-700">{clubDesc}</p>

      <TagList tags={clubTags} />

      <Button
        variant={joined ? "outline" : "default"}
        onClick={onJoin}
        disabled={joining}
        className={`mt-6 h-9 w-full rounded-md text-sm ${
          joined
            ? "border border-[var(--club-brand-orange)] text-[var(--club-brand-orange)]"
            : "bg-[var(--club-brand-orange)] text-white hover:bg-[var(--club-brand-orange-hover)]"
        }`}
      >
        {joined ? "✓ Joined" : joining ? "Joining..." : "Join"}
      </Button>
    </section>
  );
}
