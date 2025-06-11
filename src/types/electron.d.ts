import type { Project } from "./index";

export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  mulmoTest: (option: any) => Promise<void>;
  mulmoHandler: (method: string, ...args: unknown[]) => Promise<unknown>;
  onProgress: (callback: (event: any, data: any) => void) => void;
  getEnv: () => Promise<{ OPENAI_API_KEY?: string }>;
  project: {
    list: () => Promise<Project[]>;
    create: (name: string) => Promise<Project>;
    get: (name: string) => Promise<Project>;
    delete: (name: string) => Promise<boolean>;
    getPath: (name: string) => Promise<string>;
    saveProjectMetadata: (id: string, data: unknown) => Promise<boolean>;
    saveProjectScript: (id: string, data: unknown) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
