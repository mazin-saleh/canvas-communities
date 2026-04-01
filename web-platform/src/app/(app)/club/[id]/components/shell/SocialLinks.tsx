import { type SocialLink } from "./types";

type SocialLinksProps = {
  links: SocialLink[];
};

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-gray-800">Social</p>
        <div className="flex items-center gap-3 text-gray-400">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.href}
                aria-label={link.name}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-200 hover:text-gray-600"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
