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
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: any;
};

// Helper function to get projects path
const getBasePath = (): string => {
  return path.join(app.getPath("userData"), PROJECTS_DIR);
};

// Ensurer projects directory exists
export const ensureProjectBaseDirectory = async (): Promise<void> => {
  try {
    const basePath = getBasePath();
    await fs.mkdir(basePath, { recursive: true });
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

// Get project metadata
const getProjectMetadata = async (projectPath: string): Promise<ProjectMetadata> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  const content = await fs.readFile(metaFilePath, "utf-8");
  return JSON.parse(content);
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

// Generate id
const generateId = (): string => {
  const dateStr = dayjs().format("YYYYMMDD");
  const uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 8);
  return `${dateStr}-${uuid}`;
};

// List all projects
export const listProjects = async (): Promise<ProjectMetadata[]> => {
  try {
    const basePath = getBasePath();
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    const projects = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const projectPath = path.join(basePath, entry.name);
          const hasMetaFile = await checkMetaFile(projectPath);

          if (!hasMetaFile) return null;

          const metadata = await getProjectMetadata(projectPath);
          return metadata;
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
  const basePath = getBasePath();
  const id = generateId();
  const projectPath = path.join(basePath, id);

  try {
    await fs.mkdir(projectPath, { recursive: true });

    const initialData: ProjectMetadata = {
      id,
      title,
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
  const basePath = getBasePath();
  const projectPath = path.join(basePath, id);

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
  const basePath = getBasePath();
  const projectPath = path.join(basePath, id);

  return await getProjectMetadata(projectPath);
};

// Get project path
export const getProjectPath = (id: string): string => {
  const basePath = getBasePath();
  return path.join(basePath, id);
};
