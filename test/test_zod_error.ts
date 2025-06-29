import { mulmoScriptSchema } from "mulmocast";
import { zodError2MulmoError } from "../src/renderer/lib/error";
import test from "node:test";
import assert from "node:assert";

test("test ", async () => {
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
    },
    beats: [{}],
  };
  const zodError = mulmoScriptSchema.strip().safeParse(mulmoScript);
  console.log(JSON.stringify(zodError, null, 2));
});

