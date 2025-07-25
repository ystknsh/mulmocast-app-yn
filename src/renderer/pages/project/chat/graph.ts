import { type GraphData } from "graphai";
import { mulmoScriptSchema } from "mulmocast/browser";

// just chat
export const graphChat: GraphData = {
  version: 0.5,
  nodes: {
    messages: {
      value: [],
    },
    prompt: {},
    llm: {
      agent: "openAIAgent",
      isResult: true,
      params: {
        forWeb: true,
        stream: true,
        isResult: true,
      },
      inputs: { messages: ":messages", prompt: ":prompt" },
    },
  },
};

export const graphGenerateMulmoScript: GraphData = {
  version: 0.5,
  nodes: {
    messages: {
      value: [],
    },
    prompt: {},
    systemPrompt: {},
    // generate the mulmo script
    mulmoScript: {
      agent: "nestedAgent",
      inputs: {
        messages: ":messages",
        prompt: ":prompt",
        systemPrompt: ":systemPrompt",
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
          llm: {
            agent: "openAIAgent",
            isResult: true,
            params: {
              forWeb: true,
              stream: true,
              isResult: true,
              model: "gpt-4o",
            },
            console: { after: true },
            inputs: {
              system: ":systemPrompt",
              prompt: ":prompt",
              messages: ":messages",
            },
          },
          validateSchema: {
            agent: "validateSchemaAgent",
            inputs: {
              text: ":llm.text.codeBlock()",
              schema: mulmoScriptSchema,
            },
            isResult: true,
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
