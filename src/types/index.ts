export type ProjectMetadata = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  sessionActive: boolean; // TODO: Move to appropriate location later
  hasErrors: boolean; // TODO: Move to appropriate location later
};
export type Project = ProjectMetadata & {
  script: {
    [key: string]: any; //TODO: add definition for MulmoScript type
  } | null;
};
