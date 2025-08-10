import { nestedAgentGenerator } from "@graphai/vanilla/lib/graph_agents/nested_agent";

import { type GraphData, graphDataLatestVersion } from "graphai";
import { mulmoScriptSchema } from "mulmocast/browser";

// chat

// just chat
export const graphChat: GraphData = {
  version: graphDataLatestVersion,
  nodes: {
    messages: {
      value: [],
    },
    prompt: {},
    llmAgent: {},
    llm: {
      agent: ":llmAgent",
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

// just chat with tools
export const graphChatWithSearch: GraphData = {
  version: graphDataLatestVersion,
  nodes: {
    messages: {},
    tools: {},
    prompt: {},
    llmAgent: {},
    passthrough: {},
    llm: {
      isResult: true,
      agent: "toolsAgent",
      inputs: {
        llmAgent: ":llmAgent",
        tools: ":tools",
        messages: ":messages",
        passthrough: ":passthrough",
        userInput: {
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

const graphGenerateMulmoScriptInternal: GraphData = {
  version: graphDataLatestVersion,
  loop: {
    while: ":continue",
  },
  nodes: {
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
      agent: ":llmAgent",
      isResult: true,
      params: {
        forWeb: true,
        stream: true,
        isResult: true,
      },
      console: { before: true },
      inputs: {
        prompt: ":prompt",
        messages: ":messages",
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
      agent: ({ isValid, loop }) => {
        return !isValid && loop < 3;
      },
      inputs: {
        isValid: ":validateSchema.isValid",
        loop: "${@loop}",
      },
    },
  },
};

// called by graphai
export const graphGenerateMulmoScript: GraphData = {
  version: graphDataLatestVersion,
  nodes: {
    messages: {
      value: [],
    },
    llmAgent: {},
    prompt: {},
    mulmoScript: {
      agent: "nestedAgent",
      inputs: {
        messages: ":messages",
        prompt: ":prompt",
        llmAgent: ":llmAgent",
      },
      graph: graphGenerateMulmoScriptInternal,
      isResult: true,
      output: {
        data: ".validateSchema.data",
      },
    },
  },
};

// by agent
const graphMulmoScriptGeneratorAgentGraph = {
  version: graphDataLatestVersion,
  nodes: {
    data: {},
    mulmoScript: {
      agent: "nestedAgent",
      inputs: {
        messages: ":data.messages",
        prompt: ":data.prompt",
        llmAgent: ":data.llmAgent",
      },
      graph: graphGenerateMulmoScriptInternal,
      isResult: true,
      output: {
        data: ".validateSchema.data",
      },
    },
  },
};

const graphMulmoScriptGeneratorAgent = nestedAgentGenerator(graphMulmoScriptGeneratorAgentGraph, {
  resultNodeId: "mulmoScript",
});
console.log(graphMulmoScriptGeneratorAgent);

const graphMulmoScriptGeneratorAgentInfo: AgentFunctionInfo = {
  name: "graphMulmoScriptGeneratorAgent",
  agent: graphMulmoScriptGeneratorAgent,
  mock: graphMulmoScriptGeneratorAgent,
  samples: [
    {
      params: {},
      inputs: {},
      result: {},
    },
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "graphMulmoScriptGeneratorAgent--generate",
        description: "generate mulmo script json data from prompt messages",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
  ],
  description: "generate mulmo script json data from prompt messages",
  category: ["net"],
  hasGraphData: true,
  author: "Receptron team",
  repository: "https://github.com/receptron/graphai-agents/tree/main/net/exa_agent",
  source: "https://github.com/receptron/graphai-agents/tree/main/net/exa_agent/src/exa_agent.ts",
  package: "@graphai/exa_agent",
  license: "MIT",
};

export default graphMulmoScriptGeneratorAgentInfo;
