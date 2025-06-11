import { Project, ProjectMetadata } from "@/types";
export type { Project, ProjectMetadata };

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

  async saveProjectMetadata(id: string, data: unknown): Promise<boolean> {
    return await window.electronAPI.project.saveProjectMetadata(id, data);
  },

  async saveProjectScript(id: string, data: unknown): Promise<boolean> {
    return await window.electronAPI.project.saveProjectScript(id, data);
  },
};
