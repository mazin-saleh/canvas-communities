export type AnnouncementCategory = "news" | "events";

export type AnnouncementItemData = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
};

export const announcementsData: AnnouncementItemData[] = [
  {
    id: "ann-001",
    dayLabel: "Today",
    timeLabel: "10:00",
    title: "Welcome Night Agenda Posted",
    description:
      "The full run-of-show for this week\'s welcome night is now live on the club board.",
    category: "events",
  },
  {
    id: "ann-002",
    dayLabel: "Feb 20",
    timeLabel: "14:30",
    title: "Design Sprint Recap",
    description:
      "Slides and outcomes from the design sprint are available for all members to review.",
    category: "news",
  },
  {
    id: "ann-003",
    dayLabel: "Feb 19",
    timeLabel: "09:15",
    title: "Workshop Registration Open",
    description:
      "Registration for next week\'s collaboration workshop is now open with limited seats.",
    category: "events",
  },
  {
    id: "ann-004",
    dayLabel: "Feb 17",
    timeLabel: "16:45",
    title: "Mentorship Matches Released",
    description:
      "Mentorship pairings have been published. Check your inbox for assignment details.",
    category: "news",
  },
  {
    id: "ann-005",
    dayLabel: "Feb 10",
    timeLabel: "12:00",
    title: "Community Partner Update",
    description:
      "A new community partner has joined this semester to support student-led projects.",
    category: "news",
  },
  {
    id: "ann-006",
    dayLabel: "Jan 18",
    timeLabel: "18:00",
    title: "Spring Kickoff Mixer",
    description:
      "Join the kickoff mixer to meet board members, alumni mentors, and new members.",
    category: "events",
  },
];
