import { Project } from "@/types";

// ElectronAPI型の参照を確保
declare global {
  interface Window {
    electronAPI: {
      project: {
        list: () => Promise<Project[]>;
        create: (name: string) => Promise<Project>;
        get: (name: string) => Promise<Project>;
        delete: (name: string) => Promise<boolean>;
        getPath: (name: string) => Promise<string>;
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

  async get(name: string): Promise<Project> {
    return await window.electronAPI.project.get(name);
  },

  async delete(name: string): Promise<boolean> {
    return await window.electronAPI.project.delete(name);
  },

  async getPath(name: string): Promise<string> {
    return await window.electronAPI.project.getPath(name);
  },
};
