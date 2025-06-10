import { Project } from "@/types";

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
