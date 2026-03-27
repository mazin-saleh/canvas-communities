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

export default function BoardMemberCard({
  name,
  role,
  imageURL,
}: BoardMemberCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-400 sm:h-28 lg:h-32">
        {imageURL ? (
          <Image
            src={imageURL}
            alt={`${name} profile photo`}
            width={96}
            height={96}
            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white/25 text-lg font-semibold text-white sm:h-20 sm:w-20 sm:text-xl">
            {getInitials(name)}
          </div>
        )}
      </div>

      <div className="p-2 text-center">
        <p className="text-xs font-semibold text-gray-900">{role}</p>
        <p className="text-[11px] text-gray-500">{name}</p>
      </div>
    </article>
  );
}
