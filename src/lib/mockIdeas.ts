export interface Idea {
  id: number;
  title: string;
  preview: string;
  reviewed: boolean;
  createdAt: string; // ISO string
}

export const MOCK_IDEAS: Idea[] = [
  {
    id: 1,
    title: "A lighter onboarding flow",
    preview: "What if signup only asked for one thing first",
    reviewed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Pricing page rewrite",
    preview: "Lead with the outcome not the feature list",
    reviewed: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Name idea for the newsletter",
    preview: "Something short two syllables max",
    reviewed: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];