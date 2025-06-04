export type Item = {
  id: number;
  title: string;
  type: "video" | "audio";
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  date: string;
  sessionActive: boolean;
  hasErrors: boolean;
};
