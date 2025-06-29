import { mulmoScriptSchema } from "mulmocast";
import { zodError2MulmoError } from "../src/renderer/lib/error";
import test from "node:test";
import assert from "node:assert";

test("test ", async () => {
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
    },
    beats: [
      {
        text: "",
        htmlPrompt: {
          prompt: "aaaa",
          extra: "bbb",
        },
      },
    ],
  };

  const zodError = mulmoScriptSchema.strip().safeParse(mulmoScript);
  const mulmoError = zodError2MulmoError(zodError.error);
  assert.deepStrictEqual(mulmoError.beats[0], ["The object at 'htmlPrompt' contains unrecognized key(s): 'extra'."]);
});
