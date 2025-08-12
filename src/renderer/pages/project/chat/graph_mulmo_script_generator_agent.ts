import { nestedAgentGenerator } from "@graphai/vanilla/lib/graph_agents/nested_agent";
import { type AgentFunctionInfo, graphDataLatestVersion } from "graphai";
import { type MulmoScript } from "mulmocast/browser";

import { graphGenerateMulmoScriptInternal } from "./graph";
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
      output: {
        data: ".validateSchema.data",
        isValid: ".validateSchema.isValid",
        // content: ".llm.text",
      },
    },
    result: {
      inputs: {
        data: ":mulmoScript.data",
        isValid: ":mulmoScript.isValid",
      },
      isResult: true,
      agent: ({ data, isValid }: { data: MulmoScript; isValid: boolean }) => {
        return {
          data,
          // content: isValid ? JSON.stringify(data, null, 2): "failed",
          content: isValid ? "script accepted" : "failed",
        };
      },
    },
  },
};

const graphMulmoScriptGeneratorAgent = nestedAgentGenerator(graphMulmoScriptGeneratorAgentGraph, {
  resultNodeId: "result",
});

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
  repository: "https://github.com/receptron/mulmocast-app",
  license: "MIT",
};

export default graphMulmoScriptGeneratorAgentInfo;
