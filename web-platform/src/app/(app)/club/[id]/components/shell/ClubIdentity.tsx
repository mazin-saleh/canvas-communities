import Image from "next/image";
import { Button } from "@/components/ui/button";

type ClubIdentityProps = {
  logoSrc: string;
  clubName: string;
  clubDesc: string;
  clubTags: Array<string | { name?: string }>;
  joined: boolean;
  joining: boolean;
  leaving: boolean;
  onJoin: () => void;
  onLeave: () => void;
};

export default function ClubIdentity({
  logoSrc,
  clubName,
  clubDesc,
  joined,
  joining,
  leaving,
  onJoin,
  onLeave,
}: ClubIdentityProps) {
  return (
    <section className="relative z-10">
      <div className="-mt-14 mb-3 h-[72px] w-[72px] overflow-hidden rounded-xl border-2 border-white bg-[#0f2d6b] shadow-md sm:-mt-16 sm:h-20 sm:w-20 lg:-mt-20 lg:h-24 lg:w-24">
        <Image
          src={logoSrc}
          alt={clubName}
          width={96}
          height={96}
          className="h-full w-full object-cover"
        />
      </div>

      <h1 className="font-anybody text-[1.75rem] font-bold leading-tight tracking-tight text-gray-950 sm:text-3xl lg:text-[2.25rem]">
        {clubName}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-gray-600 lg:text-[15px]">
        {clubDesc}
      </p>

      <Button
        variant={joined ? "outline" : "default"}
        onClick={joined ? onLeave : onJoin}
        disabled={joining || leaving}
        className={`mt-5 h-10 w-full cursor-pointer rounded-full text-sm font-semibold ${
          joined
            ? "border-2 border-[var(--club-brand-orange)] text-[var(--club-brand-orange)] hover:bg-red-50 hover:border-red-500 hover:text-red-500"
            : "bg-[var(--club-brand-orange)] text-white hover:bg-[var(--club-brand-orange-hover)]"
        }`}
      >
        {leaving ? "Leaving..." : joined ? "✓ Joined" : joining ? "Joining..." : "Join"}
      </Button>
    </section>
  );
}
