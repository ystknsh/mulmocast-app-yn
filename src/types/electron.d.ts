import type { Project, ProjectMetadata } from "./index";
import type { MulmoScript } from "mulmocast";

export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  mulmoTest: (option: any) => Promise<void>;
  mulmoHandler: (method: string, ...args: unknown[]) => Promise<unknown>;
  onProgress: (callback: (event: any, data: any) => void) => void;
  getEnv: () => Promise<{ OPENAI_API_KEY?: string }>;
  project: {
    list: () => Promise<Project[]>;
    create: (name: string) => Promise<Project>;
    getProjectMetadata: (name: string) => Promise<ProjectMetadata>;
    getProjectMulmoScript: (name: string) => Promise<MulmoScript | null>;
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
