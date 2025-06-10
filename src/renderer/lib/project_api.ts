import { Project } from "@/types";

// ElectronAPI型の参照を確保
declare global {
  interface Window {
    electronAPI: {
      project: {
        list: () => Promise<Project[]>;
        create: (title: string) => Promise<Project>;
        get: (id: string) => Promise<Project>;
        delete: (id: string) => Promise<boolean>;
        getPath: (id: string) => Promise<string>;
      };
    };
  }
}

export const projectApi = {
  async list(): Promise<Project[]> {
    return await window.electronAPI.project.list();
  },

  async create(title: string): Promise<Project> {
    return await window.electronAPI.project.create(title);
  },

  async get(id: string): Promise<Project> {
    return await window.electronAPI.project.get(id);
  },

  async delete(id: string): Promise<boolean> {
    return await window.electronAPI.project.delete(id);
  },

  async getPath(id: string): Promise<string> {
    return await window.electronAPI.project.getPath(id);
  },
};
