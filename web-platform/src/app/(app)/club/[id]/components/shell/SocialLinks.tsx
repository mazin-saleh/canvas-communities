import { type SocialLink } from "./types";

type SocialLinksProps = {
  links: SocialLink[];
};

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
        Socials
      </p>
      <div className="flex items-center gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              aria-label={link.name}
              title={link.name}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
