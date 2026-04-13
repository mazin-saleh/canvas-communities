"use client";

import Image from "next/image";

type BoardMemberCardProps = {
  name: string;
  role: string;
  imageURL?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function BoardMemberCard({ name, role, imageURL }: BoardMemberCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Avatar area — brand orange, consistent with the rest of the page */}
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-orange-500 to-orange-400 sm:h-28 lg:h-32">
        {imageURL ? (
          <Image
            src={imageURL}
            alt={`${name} profile photo`}
            width={80}
            height={80}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white/60 sm:h-20 sm:w-20"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 text-lg font-bold text-white sm:h-20 sm:w-20 sm:text-xl">
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Name + role — role is the primary label, name is secondary */}
      <div className="px-2 py-2.5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">{role}</p>
        <p className="mt-0.5 text-xs font-medium text-gray-700">{name}</p>
      </div>
    </article>
  );
}
