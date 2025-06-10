import type { Project } from "@/lib/projectApi";

export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  mulmoTest: (option: any) => Promise<void>;
  onProgress: (callback: (event: any, data: any) => void) => void;
  getEnv: () => Promise<{ OPENAI_API_KEY?: string }>;
  project: {
    list: () => Promise<Project[]>;
    create: (name: string) => Promise<Project>;
    get: (name: string) => Promise<Project>;
    delete: (name: string) => Promise<boolean>;
    getPath: (name: string) => Promise<string>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
