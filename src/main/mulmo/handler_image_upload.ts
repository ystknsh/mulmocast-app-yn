import { getProjectPath } from "../project_manager";
import path from "path";
import fs from "fs";

const __mulmoImageUpload = async (
  projectId: string,
  dirPath: string,
  dirKey: string,
  bufferArray: Uint8Array,
  extension: string,
) => {
  const projectPath = getProjectPath(projectId);
  const dir = path.resolve(projectPath, dirPath, dirKey);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}.${extension}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(bufferArray));

  return path.join(dirPath, dirKey, filename);
};

export const mulmoReferenceImageUpload = async (
  projectId: string,
  dirKey: string,
  bufferArray: Uint8Array,
  extension: string,
) => {
  const dirPath = "upload_reference_image";
  return __mulmoImageUpload(projectId, dirPath, dirKey, bufferArray, extension);
};
export const mulmoImageUpload = async (
  projectId: string,
  index: number,
  bufferArray: Uint8Array,
  extension: string,
) => {
  const dirPath = "upload_image";
  const dirKey = String(index);
  return __mulmoImageUpload(projectId, dirPath, dirKey, bufferArray, extension);
};
