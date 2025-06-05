export type Project = {
  id: number;
  title: string;
  type: "video" | "audio" | "podcast" | "presentation";
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  date: string;
  sessionActive: boolean;
  hasErrors: boolean;
};
