import { type GraphData } from "graphai";
import { mulmoScriptSchema } from "mulmocast/browser";
// import { zodToJsonSchema } from "zod-to-json-schema";

/*
const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
  strictUnions: true,
});
*/

// just chat
export const graphChat = (llmAgent: string = "openAIAgent"): GraphData => {
  return {
    version: 0.5,
    nodes: {
      messages: {
        value: [],
      },
      prompt: {},
      llm: {
        // agent: llmAgent,
        agent: "toolsAgent",
        inputs: {
          llmAgent,
          tools: [],
          messages: ":messages",
          userInputs: {
            text: ":prompt",
            message: {
              role: "user",
              content: ":prompt",
            },
          },
        },
      },
    },
  };
};
export const graphGenerateMulmoScript = (llmAgent: string = "openAIAgent"): GraphData => {
  return {
    version: 0.5,
    nodes: {
      messages: {
        value: [],
      },
      prompt: {},
      mulmoScript: {
        agent: "nestedAgent",
        inputs: {
          messages: ":messages",
          prompt: ":prompt",
        },
        graph: {
          loop: {
            while: ":continue",
          },
          nodes: {
            counter: {
              value: 0,
              update: ":counter.add(1)",
            },
            messages: {
              update: ":newMessages.array",
            },
            newMessages: {
              agent: "pushAgent",
              inputs: {
                array: ":messages",
                items: [{ role: "user", content: ":prompt" }, ":llm.message"],
              },
              console: { after: true },
            },
            prompt: {
              update: ":nextPrompt.text",
            },
            llm: {
              agent: llmAgent,
              isResult: true,
              params: {
                forWeb: true,
                stream: true,
                isResult: true,
              },
              console: { before: true },
              inputs: {
                // system: ":systemPrompt",
                prompt: ":prompt",
                messages: ":messages",
                /*
              response_format: {
                type: "json_schema" as const,
                json_schema: {
                  name: "mulmoScript",
                  schema: {
                    type: "object",
                    properties: defaultSchema.properties
                  }
                }
                }
              */
              },
            },
            validateSchema: {
              agent: "validateSchemaAgent",
              console: { after: true },
              inputs: {
                // text: ":llm.text",
                text: ":llm.text.codeBlock()",
                schema: mulmoScriptSchema,
              },
              isResult: true,
            },
            nextPrompt: {
              agent: "copyAgent",
              inputs: {
                text: "Those are zod errors in the previous generation, fix them!! Perfect.\n\n${:validateSchema.error}",
              },
            },
            continue: {
              agent: ({ isValid, counter }) => {
                return !isValid && counter < 3;
              },
              inputs: {
                isValid: ":validateSchema.isValid",
                counter: ":counter",
              },
            },
          },
        },
        isResult: true,
        output: {
          data: ".validateSchema.data",
        },
      },
    },
  };
};
