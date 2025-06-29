import type { ZodError, ZodIssue } from "zod";
import type { MulmoError } from "../../types/index.js";

const unrecognizedKeysError = (paths: (string | number)[], keys: string[]) => {
  const pathStr = paths
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "");
  return `The object at '${pathStr}' contains unrecognized key(s): ${keys.map((k) => `'${k}'`).join(", ")}.`;
};

const invalidKeysError = (paths: (string | number)[], message: string) => {
  const pathStr = paths
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "");
  return `'${pathStr}' contains invalid data: ${message}.`;
};

const isRequiredElement = (current: ZodIssue) => {
  return current.code === "invalid_type" && current.message === "Required";
};

export const zodError2MulmoError = (error: ZodError) => {
  return (error.issues ?? []).reduce(
    (tmp: MulmoError, current) => {
      if (current.path.length === 0) {
        if (current.code === "unrecognized_keys") {
          tmp["script"]["script"] = [unrecognizedKeysError(["mulmoScript"], current.keys)];
        }
      }

      if (current.path[0] === "beats") {
        if (current.path.length === 1) {
          if (current.code === "too_small") {
            tmp["script"]["beats"] = ["Beats must contain at least 1 beat(s)."];
          }
          if (isRequiredElement(current)) {
            tmp["script"]["beats"] = ["Beats must set."];
          }
        } else {
          const [__, index, ...paths] = current.path;
          if (!tmp["beats"][String(index)]) {
            tmp["beats"][String(index)] = [];
          }
          if (current.code === "unrecognized_keys") {
            tmp["beats"][index].push(unrecognizedKeysError(paths, current.keys));
          } else if (current.code === "invalid_type") {
            tmp["beats"][index].push(invalidKeysError(paths, current.message));
          } else if (current.code === "invalid_union") {
            tmp["beats"][index].push("invalid_union: something broken.");
          } else if (current.code === "invalid_string") {
            if (current.validation === "url") {
              tmp["beats"][index].push("invalid string: " + paths.join(".") + ". url must be a valid URL.");
            } else {
              tmp["beats"][index].push("invalid string: " + paths.join(".") + ".");
            }
          } else {
            console.log(current);
          }
        }
      }

      if (current.path[0] === "$mulmocast") {
        if (isRequiredElement(current)) {
          tmp["script"]["mulmocast"] = ["$mulmocast must set."];
        }
      }
      return tmp;
    },
    { script: {}, beats: {} },
  );
};
