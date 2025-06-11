import { Project, ProjectMetadata } from "@/types";
export type { Project, ProjectMetadata };

export const projectApi = {
  async list(): Promise<Project[]> {
    return await window.electronAPI.project.list();
  },

  async create(title: string): Promise<ProjectMetadata> {
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
