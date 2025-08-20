import { getProjectPath } from "../project_manager";
import path from "path";
import fs from "fs";

export const mulmoAudioBgmUpload = async (projectId: string, filename: string, bufferArray: Uint8Array) => {
  const dirPath = "upload_audio_bgm";

  const projectPath = getProjectPath(projectId);
  const dir = path.resolve(projectPath, dirPath);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, Buffer.from(bufferArray));

  return path.join(dirPath, filename);
};

export const mulmoAudioBgmGet = async (projectId: string, bgmPath: string) => {
  const projectPath = getProjectPath(projectId);

  const cleanPath = bgmPath.replace(/^\.\//, "");
  const filePath = path.resolve(projectPath, cleanPath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`BGM file not found: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  return buffer;
};
