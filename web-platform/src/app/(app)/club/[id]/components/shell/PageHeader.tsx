import Image from "next/image";

type PageHeaderProps = {
  clubName: string;
  bannerSrc?: string;
  gradient?: string;
};

export default function PageHeader({
  clubName,
  bannerSrc,
  gradient,
}: PageHeaderProps) {
  return (
    <header className="relative h-[140px] overflow-hidden border-b border-gray-200 sm:h-[170px] lg:h-[210px]">
      {bannerSrc ? (
        <Image
          src={bannerSrc}
          alt={`${clubName} banner`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage: gradient,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10" />
    </header>
  );
}
