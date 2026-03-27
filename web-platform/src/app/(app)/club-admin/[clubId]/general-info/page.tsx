import GeneralInfoForm, {
  type ClubIdentityDraft,
} from "../../components/general-info/GeneralInfoForm";

const defaultGeneralInfoValue: ClubIdentityDraft = {
  clubName: "Gator Coding Club",
  bannerSrc: "/background.png",
  clubDesc:
    "A student-led community focused on collaborative software projects, mentorship, and technical workshops across campus.",
  clubTags: ["Tech", "Community", "Workshops"],
  socialLinks: [
    { platform: "Website", href: "gatorcodingclub.org" },
    { platform: "Instagram", href: "instagram.com/gatorcodingclub" },
    { platform: "LinkedIn", href: "linkedin.com/company/gatorcodingclub" },
    { platform: "Discord", href: "discord.gg/gatorcoding" },
  ],
};

export default function ClubGeneralInfoPage() {
  return <GeneralInfoForm initialValue={defaultGeneralInfoValue} />;
}
