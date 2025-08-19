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