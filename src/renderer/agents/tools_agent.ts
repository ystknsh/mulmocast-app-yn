import type { AgentFunctionInfo } from "graphai";
import { nestedAgentGenerator } from "@graphai/vanilla/lib/generator";

const toolWorkFlowStep = {
  version: 0.5,
  nodes: {
    passthrough: { value: {} },
    llm: {
      agent: ":llmAgent",
      isResult: true,
      params: {
        forWeb: true,
        stream: true,
      },
      inputs: {
        messages: ":messages",
        prompt: ":userInput.text",
        tools: ":tools",
      },
    },
    textMessagesArray: {
      unless: ":llm.tool.id",
      agent: "pushAgent",
      inputs: {
        array: ":messages",
        items: [":userInput.message", { role: "assistant", content: ":llm.message.content" }],
      },
    },
    textMessages: {
      agent: "copyAgent",
      inputs: { messages: ":textMessagesArray.array" },
    },
    tool_calls: {
      if: ":llm.tool_calls",
      agent: "mapAgent",
      inputs: {
        rows: ":llm.tool_calls",
        messages: ":messages",
        passthrough: ":passthrough",
      },
      params: {
        compositeResult: true,
        rowKey: "tool_call",
      },
      graph: {
        version: 0.5,
        nodes: {
          data: {
            // console: { before: true},
            agent: ({ passthrough, agentName }: { passthrough: Record<string, unknown>; agentName: string }) => {
              // console.log({passthrough, agentName});
              if (passthrough && passthrough[agentName]) {
                return passthrough[agentName];
              }
              return {};
            },
            inputs: {
              passthrough: ":passthrough",
              agentName: ":tool_call.name.split(--).$0",
            },
          },
          tool: {
            isResult: true,
            agent: ":tool_call.name.split(--).$0",
            inputs: {
              arg: ":tool_call.arguments",
              func: ":tool_call.name.split(--).$1",
              tool_call: ":tool_call",
              data: ":data",
            },
          },
          message: {
            isResult: true,
            agent: "copyAgent",
            inputs: {
              role: "tool",
              tool_call_id: ":tool_call.id",
              name: ":tool_call.name",
              content: ":tool.content",
            },
          },
        },
      },
    },
    // tools response if hasNext in response.
    toolsMessage: {
      agent: "pushAgent",
      inputs: {
        array: [":userInput.message", ":llm.message"],
        items: ":tool_calls.message",
      },
    },
    tool_call_response: {
      agent: "nestedAgent",
      inputs: {
        toolsResponse: ":tool_calls.tool",
        llmAgent: ":llmAgent",
        toolsMessage: ":toolsMessage",
      },
      graph: {
        nodes: {
          hasNext: {
            agent: (namedInputs: { array: { hasNext: boolean }[] }) => {
              return namedInputs.array.some((ele) => ele.hasNext);
            },
            inputs: {
              array: ":toolsResponse",
            },
          },
          toolsResponseLLM: {
            if: ":hasNext",
            agent: ":llmAgent",
            isResult: true,
            params: {
              forWeb: true,
              stream: true,
            },
            inputs: { messages: ":toolsMessage.array" },
          },
          toolsResMessage: {
            agent: "pushAgent",
            inputs: {
              array: ":toolsMessage.array",
              item: ":toolsResponseLLM.message",
            },
          },
          skipToolsResponseLLM: {
            unless: ":hasNext",
            agent: "copyAgent",
            inputs: {
              array: ":toolsMessage.array",
            },
          },
          mergeToolsResponse: {
            isResult: true,
            agent: "copyAgent",
            anyInput: true,
            inputs: {
              array: [":toolsResMessage.array", ":skipToolsResponseLLM.array"],
            },
          },
        },
      },
    },
    mergedData: {
      inputs: {
        data: ":tool_calls.tool",
        tool_calls: ":llm.tool_calls",
      },
      agent: ({ tool_calls, data }: { tool_calls: { name: string }[]; data: unknown[] }) => {
        const ret: Record<string, unknown> = {};
        tool_calls.forEach((tool, index) => {
          const { name } = tool;
          ret[name] = data[index];
        });
        return ret;
      },
    },
    toolsMessages: {
      agent: "pushAgent",
      inputs: { array: ":messages", items: ":tool_call_response.mergeToolsResponse.array.$0" },
    },
    toolsResult: {
      agent: "copyAgent",
      inputs: {
        messages: ":toolsMessages.array",
        data: ":mergedData",
      },
    },
    buffer: {
      agent: "copyAgent",
      anyInput: true,
      inputs: { array: [":textMessages", ":toolsResult"] },
    },
    result: {
      agent: "copyAgent",
      isResult: true,
      inputs: { messages: ":buffer.array.$0.messages", data: ":buffer.array.$0.data" },
    },
  },
};

const toolsAgent = nestedAgentGenerator(toolWorkFlowStep, { resultNodeId: "result" });

const toolsAgentInfo: AgentFunctionInfo = {
  name: "toolsAgent",
  agent: toolsAgent,
  mock: toolsAgent,
  samples: [
    {
      inputs: {
        llmAgent: "openAIAgent",
        tools: [
          {
            type: "function",
            function: {
              name: "lightAgent--toggleLight",
              description: "Switch of light",
              parameters: {
                type: "object",
                properties: {
                  switch: {
                    type: "boolean",
                    description: "change light state",
                  },
                },
              },
            },
          },
        ],
        messages: [
          {
            role: "system",
            content: "You are a light switch. Please follow the user's instructions.",
          },
        ],
        userInput: {
          text: "turn on the light.",
          message: {
            role: "user",
            content: "turn on the light.",
          },
        },
      },
      params: {},
      result: "",
    },
  ],
  description: "",
  category: [],
  author: "",
  repository: "",
  source: "https://github.com/receptron/graphai/blob/main/llm_agents/tools_agent/src/tools_agent.ts",
  package: "@graphai/tools_agent",
  license: "",
  hasGraphData: true,
};

export default toolsAgentInfo;
