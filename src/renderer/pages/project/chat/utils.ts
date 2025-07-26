import { mulmoScriptSchema } from "mulmocast/browser";
import { zodToJsonSchema } from "zod-to-json-schema";

export const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
  strictUnions: true,
});
