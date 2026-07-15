export const profileAvatarOptions = [
  {
    backgroundColor: "#f2e7ff",
    color: "#7657e3",
    iconName: "star-four-points",
    id: "star",
    label: "ほし",
  },
  {
    backgroundColor: "#ffe5f2",
    color: "#e96aa7",
    iconName: "heart",
    id: "heart",
    label: "ハート",
  },
  {
    backgroundColor: "#e6fbff",
    color: "#3fb5cf",
    iconName: "moon-waning-crescent",
    id: "moon",
    label: "つき",
  },
  {
    backgroundColor: "#fff2cf",
    color: "#d99823",
    iconName: "flower-tulip-outline",
    id: "flower",
    label: "お花",
  },
] as const;

export type ProfileAvatarId = (typeof profileAvatarOptions)[number]["id"];

export function isProfileAvatarId(id: unknown): id is ProfileAvatarId {
  return profileAvatarOptions.some((avatar) => avatar.id === id);
}

export function getProfileAvatarOption(id: unknown) {
  return (
    profileAvatarOptions.find((avatar) => avatar.id === id) ??
    profileAvatarOptions[0]
  );
}
