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

const getProjectMetaPath = (projectId: string): string => {
  const projectPath = getProjectPath(projectId);
  return path.join(projectPath, META_DATA_FILE_NAME);
};

const getProjectScriptPath = (projectId: string): string => {
  const projectPath = getProjectPath(projectId);
  return path.join(projectPath, SCRIPT_FILE_NAME);
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

const readJsonFile = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    console.error(`not hit: ${filePath}`);
    return null;
  }
};

const writeJsonFile = (filePath: string, data: unknown) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
const getProjectMetadata = async (projectId: string): Promise<ProjectMetadata> => {
  const projectMetaPath = getProjectMetaPath(projectId);
  return readJsonFile(projectMetaPath);
};

const getProjectScriptIfExists = async (projectId: string): Promise<Project["script"] | null> => {
  const scriptFilePath = getProjectScriptPath(projectId);
  return readJsonFile(scriptFilePath);
};

const saveProjectMetadata = async (projectId: string, data: ProjectMetadata): Promise<void> => {
  const projectMetaPath = getProjectMetaPath(projectId);
  await writeJsonFile(projectMetaPath, data);
};

const saveProjectScript = async (projectId: string, data: ProjectMetadata): Promise<void> => {
  const scriptFilePath = getProjectScriptPath(projectId);
  await writeJsonFile(scriptFilePath, data);
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
          const projectId = entry.name;
          const metadata = await getProjectMetadata(projectId);
          if (metadata === null) {
            return null;
          }
          const script = await getProjectScriptIfExists(projectId);

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

    await saveProjectMetadata(id, initialData);

    return {
      metadata: initialData,
      script: null,
    };
  } catch (error) {
    // Cleanup on failure
    await deleteProject(id);
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
