import { mulmoScriptSchema } from "mulmocast/browser";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodType } from "zod";

export const defaultSchema = zodToJsonSchema(mulmoScriptSchema as unknown as ZodType, {
  strictUnions: true,
});
