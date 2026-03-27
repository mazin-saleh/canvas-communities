export type GalleryMediaType = "image" | "video";

export type GalleryMedia = {
  id: string;
  src: string;
  type: GalleryMediaType;
  category: string;
  alt: string;
  caption?: string;
  thumbnailSrc?: string;
};

export const galleryData: GalleryMedia[] = [
  {
    id: "gal-001",
    src: "/gator-hero.png",
    type: "image",
    category: "Community",
    alt: "Club community event banner",
    caption: "Community showcase kickoff",
  },
  {
    id: "gal-002",
    src: "/background.png",
    type: "image",
    category: "Campus",
    alt: "Campus scene background used for club promotions",
    caption: "Campus afternoon social",
  },
  {
    id: "gal-003",
    src: "/landingbackground.png",
    type: "image",
    category: "Outreach",
    alt: "Colorful promotional backdrop used for outreach events",
    caption: "Outreach design wall",
  },
  {
    id: "gal-004",
    src: "/gator-hero.png",
    type: "image",
    category: "Workshop",
    alt: "Students gathering for workshop sessions",
    caption: "Build night highlights",
  },
  {
    id: "gal-005",
    src: "/background.png",
    type: "image",
    category: "Community",
    alt: "Group photo area during club event",
    caption: "Member social circle",
  },
  {
    id: "gal-006",
    src: "/landingbackground.png",
    type: "image",
    category: "Outreach",
    alt: "Creative brand visuals from club campaign",
    caption: "Campaign visual board",
  },
];
