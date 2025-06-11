import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import dayjs from "dayjs";
import { Project, ProjectMetadata } from "../types";

const PROJECTS_DIR = "projects";
const META_DATA_FILE_NAME = "meta.json";
const SCRIPT_FILE_NAME = "script.json";
const PROJECT_VERSION = "1.0.0";

const getBasePath = (): string => {
  return path.join(app.getPath("userData"), PROJECTS_DIR);
};

const getProjectPath = (projectId: string): string => {
  const basePath = getBasePath();
  return path.join(basePath, projectId);
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
const checkMetaFile = async (projectId: string): Promise<boolean> => {
  const projectPath = getProjectPath(projectId);
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  try {
    await fs.access(metaFilePath);
    return true;
  } catch {
    return false;
  }
};

const getProjectMetadata = async (projectId: string): Promise<ProjectMetadata> => {
  const projectPath = getProjectPath(projectId);
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  const content = await fs.readFile(metaFilePath, "utf-8");
  return JSON.parse(content);
};

const getProjectScriptIfExists = async (projectId: string): Promise<Project["script"] | null> => {
  const projectPath = getProjectPath(projectId);
  const scriptFilePath = path.join(projectPath, SCRIPT_FILE_NAME);
  try {
    const content = await fs.readFile(scriptFilePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const saveProjectMetadata = async (projectPath: string, data: ProjectMetadata): Promise<void> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  await fs.writeFile(metaFilePath, JSON.stringify(data, null, 2));
};

const saveProjectScript = async (projectPath: string, data: ProjectMetadata): Promise<void> => {
  const metaFilePath = path.join(projectPath, META_DATA_FILE_NAME);
  await fs.writeFile(metaFilePath, JSON.stringify(data, null, 2));
};

const deleteProjectDirectory = async (projectPath: string): Promise<void> => {
  try {
    await fs.rm(projectPath, { recursive: true, force: true });
  } catch {
    // Ignore errors during cleanup
  }
};

const generateId = (): string => {
  const dateStr = dayjs().format("YYYYMMDD");
  const uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 8);
  return `${dateStr}-${uuid}`;
};

export const listProjects = async (): Promise<Project[]> => {
  try {
    const basePath = getBasePath();
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    const projects = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const hasMetaFile = await checkMetaFile(entry.name);

          if (!hasMetaFile) return null;

          const metadata = await getProjectMetadata(entry.name);
          const script = await getProjectScriptIfExists(entry.name);

          return {
            metadata,
            script,
          };
        }),
    );

    return projects.filter((project): project is Project => project !== null);
  } catch (error) {
    console.error("Failed to list projects:", error);
    return [];
  }
};

// Create a new project
export const createProject = async (title: string): Promise<Project> => {
  const id = generateId();
  const projectPath = getProjectPath(id);
  console.log(projectPath);
  try {
    await fs.mkdir(projectPath, { recursive: true });

    const initialData: ProjectMetadata = {
      id,
      title,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      version: PROJECT_VERSION,
      sessionActive: false,
      hasErrors: false,
    };

    await saveProjectMetadata(projectPath, initialData);

    return {
      metadata: initialData,
      script: null,
    };
  } catch (error) {
    // Cleanup on failure
    await deleteProjectDirectory(projectPath);
    console.error("Failed to create project:", error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const projectPath = getProjectPath(id);

  try {
    await fs.rm(projectPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
};

export const getProject = async (id: string): Promise<ProjectMetadata> => {
  return await getProjectMetadata(id);
};

