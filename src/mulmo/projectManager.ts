import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import dayjs from "dayjs";

const PROJECTS_DIR = "projects";
const META_DATA_FILE_NAME = "meta.json";
const PROJECT_VERSION = "1.0.0";

export type ProjectMetadata = {
  name: string; // Directory name (internal use)
  title: string; // Display name
  path: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  [key: string]: any;
};

export type CreateProjectData = {
  title: string;
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

// Validate project title
const validateProjectTitle = (title: string): void => {
  if (!title || typeof title !== "string") {
    throw new Error("Project title is required");
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Project title cannot be empty");
  }
};

// Generate directory name
const generateDirectoryName = (): string => {
  // Generate YYYYMMDD-random format
  const dateStr = dayjs().format("YYYYMMDD");
  const random = Math.random().toString(36).substring(2, 8).toLowerCase();
  return `${dateStr}-${random}`;
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
};

// Create a new project
export const createProject = async (title: string): Promise<ProjectMetadata> => {
  validateProjectTitle(title);

  const projectsPath = getProjectsPath();
  const name = generateDirectoryName();
  const projectPath = path.join(projectsPath, name);

  try {
    await fs.mkdir(projectPath, { recursive: true });

    const initialData: ProjectMetadata = {
      name,
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
export const deleteProject = async (name: string): Promise<boolean> => {
  const projectsPath = getProjectsPath();
  const projectPath = path.join(projectsPath, name);

  if (!(await projectExists(projectPath))) {
    throw new Error(`Project "${name}" not found`);
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
export const getProject = async (name: string): Promise<ProjectMetadata> => {
  const projectsPath = getProjectsPath();
  const projectPath = path.join(projectsPath, name);

  if (!(await projectExists(projectPath))) {
    throw new Error(`Project "${name}" not found`);
  }

  try {
    const metadata = await getProjectMetadata(projectPath);
    return {
      name,
      title: metadata.title || name, // Fallback to name if title doesn't exist
      path: projectPath,
      ...metadata,
    } as ProjectMetadata;
  } catch (error) {
    console.error("Failed to get project:", error);
    throw error;
  }
};

// Get project path
export const getProjectPath = (name: string): string => {
  const projectsPath = getProjectsPath();
  return path.join(projectsPath, name);
};
