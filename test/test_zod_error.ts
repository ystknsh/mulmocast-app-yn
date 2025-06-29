import { mulmoScriptSchema } from "mulmocast";
import { zodError2MulmoError } from "../src/renderer/lib/error";
import test from "node:test";
import assert from "node:assert";

const validData = {
  $mulmocast: {
    version: "1.0",
  },
  beats: [{}],
};

// script
test("test beats empty error", async () => {
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
    },
    beats: [],
  };

  const zodError = mulmoScriptSchema.strip().safeParse(mulmoScript);
  const mulmoError = zodError2MulmoError(zodError.error);
  assert.deepStrictEqual(mulmoError.script.beats, ["Beats must contain at least 1 beat(s)."]);
});

test("test mulmoScript empty error", async () => {
  const mulmoScript = {};

  const zodError = mulmoScriptSchema.safeParse(mulmoScript);
  const mulmoError = zodError2MulmoError(zodError.error);
  assert.deepStrictEqual(mulmoError.script.beats, ["Beats must set."]);
  assert.deepStrictEqual(mulmoError.script.mulmocast, ["$mulmocast must set."]);
});

test("test extra mulmoScript attribute", async () => {
  const mulmoScript = { ...validData, extra: "aaa" };

  const zodError = mulmoScriptSchema.safeParse(mulmoScript);
  // console.log(zodError.error);
  const mulmoError = zodError2MulmoError(zodError.error);
  // console.log(mulmoError);
  assert.deepStrictEqual(mulmoError.script.script, [
    "The object at 'mulmoScript' contains unrecognized key(s): 'extra'.",
  ]);
});

// beats
test("test beats extra element error", async () => {
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

test("test beats invalid data error", async () => {
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
    },
    beats: [
      {
        text: "",
        imagePrompt: {
          prompt: "aaaa",
        },
      },
    ],
  };

  const zodError = mulmoScriptSchema.strip().safeParse(mulmoScript);
  const mulmoError = zodError2MulmoError(zodError.error);
  assert.deepStrictEqual(mulmoError.beats[0], [
    "'imagePrompt' contains invalid data: Expected string, received object.",
  ]);
});

test("test beats invalid string error", async () => {
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
    },
    beats: [
      {
        text: "",
        image: {
          type: "image",
          source: {
            kind: "url",
            url: "",
          },
        },
      },
    ],
  };

  const zodError = mulmoScriptSchema.strip().safeParse(mulmoScript);
  const mulmoError = zodError2MulmoError(zodError.error);
  assert.deepStrictEqual(mulmoError.beats[0], ["invalid string: image.source.url."]);
});
