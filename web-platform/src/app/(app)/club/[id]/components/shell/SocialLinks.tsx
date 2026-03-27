import { type SocialLink } from "./types";

type SocialLinksProps = {
  links: SocialLink[];
};

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="mt-5 border-t border-gray-300 pt-3">
      <p className="text-sm font-medium text-gray-700">Social</p>
      <div className="mt-2 flex items-center gap-2 text-gray-400">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              aria-label={link.name}
              className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-gray-200"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
