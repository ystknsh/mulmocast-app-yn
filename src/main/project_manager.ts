import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import dayjs from "dayjs";

const PROJECTS_DIR = "projects";
const META_DATA_FILE_NAME = "meta.json";
const PROJECT_VERSION = "1.0.0";

export type ProjectMetadata = {
  id: string;
  title: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: any;
};

export type UpdateProjectData = Partial<Omit<ProjectMetadata, "name" | "path" | "createdAt">>;

// Helper function to get projects path
const getProjectsPath = (): string => {
  return path.join(app.getPath("userData"), PROJECTS_DIR);
};

// Ensure projects directory exists
export const ensureProjectsDirectory = async (): Promise<void> => {
  try {
    const projectsPath = getProjectsPath();
    await fs.mkdir(projectsPath, { recursive: true });
  } catch (error) {
    console.error("Failed to create projects directory:", error);
  }
};

// Check if a meta data file exists
const checkMetaFile = async (projectPath: string): Promise<boolean> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  try {
    await fs.access(metaFilePath);
    return true;
  } catch {
    return false;
  }
};

// Check if a project exists
const projectExists = async (projectPath: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(projectPath);
    return stats.isDirectory() && (await checkMetaFile(projectPath));
  } catch {
    return false;
  }
};

// Get project metadata
const getProjectMetadata = async (projectPath: string): Promise<Partial<ProjectMetadata>> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  try {
    const content = await fs.readFile(metaFilePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read project metadata:", error);
    return {};
  }
};

// Save project metadata
const saveProjectMetadata = async (projectPath: string, data: ProjectMetadata): Promise<void> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  await fs.writeFile(metaFilePath, JSON.stringify(data, null, 2));
};

// Delete project directory
const deleteProjectDirectory = async (projectPath: string): Promise<void> => {
  try {
    await fs.rm(projectPath, { recursive: true, force: true });
  } catch {
    // Ignore errors during cleanup
  }
};

// Generate directory name
const generateId = (): string => {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 12);
};

// List all projects
export const listProjects = async (): Promise<ProjectMetadata[]> => {
  try {
    const projectsPath = getProjectsPath();
    const entries = await fs.readdir(projectsPath, { withFileTypes: true });
    const projects = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const projectPath = path.join(projectsPath, entry.name);
          const hasMetaFile = await checkMetaFile(projectPath);

          if (!hasMetaFile) return null;

          const metadata = await getProjectMetadata(projectPath);
          return {
            id: entry.name,
            path: projectPath,
            ...metadata,
          };
        }),
    );

    return projects.filter((project): project is ProjectMetadata => project !== null);
  } catch (error) {
    console.error("Failed to list projects:", error);
    return [];
  }
};

// Create a new project
export const createProject = async (title: string): Promise<ProjectMetadata> => {
  const projectsPath = getProjectsPath();
  const id = generateId();
  const projectPath = path.join(projectsPath, id);

  try {
    await fs.mkdir(projectPath, { recursive: true });

    const initialData: ProjectMetadata = {
      id,
      title,
      path: projectPath,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      version: PROJECT_VERSION,
    };

    await saveProjectMetadata(projectPath, initialData);

    return initialData;
  } catch (error) {
    // Cleanup on failure
    await deleteProjectDirectory(projectPath);
    console.error("Failed to create project:", error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (id: string): Promise<boolean> => {
  const projectsPath = getProjectsPath();
  const projectPath = path.join(projectsPath, id);

  if (!(await projectExists(projectPath))) {
    throw new Error(`Project "${id}" not found`);
  }

  try {
    await fs.rm(projectPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
};

// Get a specific project
export const getProject = async (id: string): Promise<ProjectMetadata> => {
  const projectsPath = getProjectsPath();
  const projectPath = path.join(projectsPath, id);

  if (!(await projectExists(projectPath))) {
    throw new Error(`Project "${id}" not found`);
  }

  try {
    const metadata = await getProjectMetadata(projectPath);
    return {
      id,
      path: projectPath,
      ...metadata,
    } as ProjectMetadata;
  } catch (error) {
    console.error("Failed to get project:", error);
    throw error;
  }
};

// Get project path
export const getProjectPath = (id: string): string => {
  const projectsPath = getProjectsPath();
  return path.join(projectsPath, id);
};
