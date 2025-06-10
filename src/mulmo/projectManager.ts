import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";

const PROJECTS_DIR = "projects";
const META_DATA_FILE_NAME = "meta.json";
const PROJECT_VERSION = "1.0.0";

export type ProjectMetadata = {
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: any;
};

export type CreateProjectData = {
  name: string;
  [key: string]: any;
};

export type UpdateProjectData = Partial<Omit<ProjectMetadata, "name" | "path" | "createdAt">>;

export class ProjectManager {
  private readonly projectsPath: string;

  constructor() {
    this.projectsPath = path.join(app.getPath("userData"), PROJECTS_DIR);
    this.ensureProjectsDirectory();
  }

  private async ensureProjectsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.projectsPath, { recursive: true });
    } catch (error) {
      console.error("Failed to create projects directory:", error);
    }
  }

  async listProjects(): Promise<ProjectMetadata[]> {
    try {
      const entries = await fs.readdir(this.projectsPath, { withFileTypes: true });
      const projects = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory())
          .map(async (entry) => {
            const projectPath = path.join(this.projectsPath, entry.name);
            const hasConfigFile = await this.checkConfigFile(projectPath);

            if (!hasConfigFile) return null;

            const metadata = await this.getProjectMetadata(projectPath);
            return {
              name: entry.name,
              path: projectPath,
              ...metadata,
            } as ProjectMetadata;
          }),
      );

      return projects.filter((project): project is ProjectMetadata => project !== null);
    } catch (error) {
      console.error("Failed to list projects:", error);
      return [];
    }
  }

  async createProject(name: string): Promise<ProjectMetadata> {
    this.validateProjectName(name);

    const projectPath = path.join(this.projectsPath, name);

    // Check if project already exists
    if (await this.projectExists(projectPath)) {
      throw new Error(`Project "${name}" already exists`);
    }

    try {
      await fs.mkdir(projectPath, { recursive: true });

      const initialData: ProjectMetadata = {
        name,
        path: projectPath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: PROJECT_VERSION,
      };

      await this.saveProjectMetadata(projectPath, initialData);

      return initialData;
    } catch (error) {
      // Cleanup on failure
      await this.deleteProjectDirectory(projectPath);
      console.error("Failed to create project:", error);
      throw error;
    }
  }

  async deleteProject(name: string): Promise<boolean> {
    const projectPath = path.join(this.projectsPath, name);

    if (!(await this.projectExists(projectPath))) {
      throw new Error(`Project "${name}" not found`);
    }

    try {
      await fs.rm(projectPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  }

  async getProject(name: string): Promise<ProjectMetadata> {
    const projectPath = path.join(this.projectsPath, name);

    if (!(await this.projectExists(projectPath))) {
      throw new Error(`Project "${name}" not found`);
    }

    try {
      const metadata = await this.getProjectMetadata(projectPath);
      return {
        name,
        path: projectPath,
        ...metadata,
      } as ProjectMetadata;
    } catch (error) {
      console.error("Failed to get project:", error);
      throw error;
    }
  }

  async updateProject(name: string, data: UpdateProjectData): Promise<ProjectMetadata> {
    const projectPath = path.join(this.projectsPath, name);

    if (!(await this.projectExists(projectPath))) {
      throw new Error(`Project "${name}" not found`);
    }

    try {
      const existingData = await this.getProjectMetadata(projectPath);
      const updatedData = {
        ...existingData,
        ...data,
        name, // Ensure name is not changed
        path: projectPath, // Ensure path is not changed
        updatedAt: new Date().toISOString(),
      } as ProjectMetadata;

      await this.saveProjectMetadata(projectPath, updatedData);

      return updatedData;
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  }

  private async checkConfigFile(projectPath: string): Promise<boolean> {
    const configFilePath = path.join(projectPath, META_DATA_FILE_NAME);

    try {
      await fs.access(configFilePath);
      return true;
    } catch {
      return false;
    }
  }

  private async projectExists(projectPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(projectPath);
      return stats.isDirectory() && (await this.checkConfigFile(projectPath));
    } catch {
      return false;
    }
  }

  private async getProjectMetadata(projectPath: string): Promise<Partial<ProjectMetadata>> {
    const configFilePath = path.join(projectPath, META_DATA_FILE_NAME);

    try {
      const content = await fs.readFile(configFilePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read project metadata:", error);
      return {};
    }
  }

  private async saveProjectMetadata(projectPath: string, data: ProjectMetadata): Promise<void> {
    const configFilePath = path.join(projectPath, META_DATA_FILE_NAME);
    await fs.writeFile(configFilePath, JSON.stringify(data, null, 2));
  }

  private async deleteProjectDirectory(projectPath: string): Promise<void> {
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch {
      // Ignore errors during cleanup
    }
  }

  private validateProjectName(name: string): void {
    if (!name || typeof name !== "string") {
      throw new Error("Project name is required");
    }

    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Project name cannot be empty");
    }
  }

  getProjectPath(name: string): string {
    return path.join(this.projectsPath, name);
  }
}

export const projectManager = new ProjectManager();
