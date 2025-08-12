import { GraphAIOnError, GraphAIDebug, GraphAISupressError } from "@graphai/agent_utils";
import { AgentFunction, AgentFunctionInfo, DefaultConfigData } from "graphai";

export const puppeteerAgent: AgentFunction = async ({ params, namedInputs, config }) => {
  const { arg } = {
    ...namedInputs,
  };
  const { url } = arg;
  const content = await window.electronAPI.mulmoHandler("graphaiPuppeteerAgent", { url });
  console.log(content);
  return content;
};

const puppeteerAgentInfo: AgentFunctionInfo = {
  name: "puppeteerAgent",
  agent: puppeteerAgent,
  mock: puppeteerAgent,
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
        name: "puppeteerAgent--openUrl",
        description: "open web url",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "web site url",
            },
          },
          required: ["url"],
        },
      },
    },
  ],
  description: "Puppeteer Agent",
  category: ["net"],
  author: "Receptron team",
  license: "MIT",
};

export default puppeteerAgentInfo;
