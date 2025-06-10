export type Project = {
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: any;
};

export const projectApi = {
  async list(): Promise<Project[]> {
    return await window.electronAPI.project.list();
  },

  async create(name: string): Promise<Project> {
    return await window.electronAPI.project.create(name);
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
