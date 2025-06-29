import type { ZodError } from "zod";
import type { MulmoError } from "../../types/index.js";

export const zodError2MulmoError = (error: ZodError) => {
  return (error.issues ?? []).reduce(
    (tmp: MulmoError, current) => {
      if (current.path[0] === "beats" && current.code === "unrecognized_keys") {
        const [__, index, ...keys] = current.path;

        const pathStr = keys
          .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
          .join("")
          .replace(/^\./, "");
        if (!tmp["beats"][String(index)]) {
          tmp["beats"][String(index)] = [];
        }
        tmp["beats"][index].push(
          `The object at '${pathStr}' contains unrecognized key(s): ${current.keys.map((k) => `'${k}'`).join(", ")}.`,
        );
      } else {
        console.log(current);
      }
      return tmp;
    },
    { beats: {} },
  );
};
