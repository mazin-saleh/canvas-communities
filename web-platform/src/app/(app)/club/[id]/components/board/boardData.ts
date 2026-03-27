export type BoardMember = {
  id: string;
  name: string;
  role: string;
  imageURL?: string;
};

export type BoardSectionData = {
  id: string;
  title: string;
  members: BoardMember[];
};

export const boardSectionsData: BoardSectionData[] = [
  {
    id: "main-board",
    title: "Main Board",
    members: [
      {
        id: "member-001",
        role: "President",
        name: "Jacobo Menasche",
      },
      {
        id: "member-002",
        role: "Vice President",
        name: "Yefriisca",
      },
      {
        id: "member-003",
        role: "Finances",
        name: "Franklin",
      },
      {
        id: "member-004",
        role: "Treasury",
        name: "Jeremy",
      },
      {
        id: "member-005",
        role: "Outreach",
        name: "Tiffany",
      },
    ],
  },
];
