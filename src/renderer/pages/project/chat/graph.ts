import { type GraphData } from "graphai";

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

/*
export const graphAAAData: GraphData = {
  version: 0.5,
  nodes: {
    systemPrompt: {
      value: "",
    },
    chatMessages: {
      value: "",
    },
    prompt: {
      value: "",
    },
    // generate the mulmo script
    mulmoScript: {
      agent: "nestedAgent",
      inputs: {
        chatMessages: ":chatMessages",
        systemPrompt: ":systemPrompt",
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
          llm: {
            agent: "openAIAgent",
            inputs: {
              prompt: ":prompt",
              messages: ":chatMessages",
              params: {
                system: ":systemPrompt",
                model: "gpt-4o",
              },
            },
          },
          validateSchemaAgent: {
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
              isValid: ":validateSchemaAgent.isValid",
              counter: ":counter",
            },
          },
        },
      },
      isResult: true,
      output: {
        data: ".validateSchemaAgent.data",
      },
    },
  },
};
*/
