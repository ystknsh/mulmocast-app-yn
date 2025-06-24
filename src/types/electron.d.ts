import type { Project, ProjectMetadata, MulmoProgressLog } from "./index";
import type { MulmoScript } from "mulmocast";
import type { IpcRendererEvent } from "electron";

export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  mulmoTest: (option: unknown) => Promise<void>;
  mulmoHandler: (method: string, ...args: unknown[]) => Promise<unknown>;
  onProgress: (callback: (event: IpcRendererEvent, data: MulmoProgressLog) => void) => void;
  getEnv: () => Promise<{
    OPENAI_API_KEY?: string;
    NIJIVOICE_API_KEY?: string;
  }>;
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
  settings: {
    get: () => Promise<{ openaiKey?: string; nijivoiceApiKey?: string }>;
    set: (settings: { openaiKey?: string; nijivoiceApiKey?: string }) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
