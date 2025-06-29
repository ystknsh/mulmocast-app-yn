import type { MulmoScript, MulmoPresentationStyle } from "mulmocast";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProjectMetadata = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  sessionActive: boolean; // TODO: Move to appropriate location later
  hasErrors: boolean; // TODO: Move to appropriate location later
  chatMessages: ChatMessage[];
  useCache?: boolean;
  presentationStyle?: MulmoPresentationStyle;
};
export type Project = {
  metadata: ProjectMetadata;
  script: MulmoScript | null;
};

export type MulmoProgressLog<T = unknown> = {
  projectId: string;
  type: string;
  data: T;
};

export type MulmoError = { beats: Record<string, string[]>; script: Record<string, string[]> };
