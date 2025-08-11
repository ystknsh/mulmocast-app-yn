import type { AgentFunctionInfo } from "graphai";
import { nestedAgentGenerator } from "@graphai/vanilla/lib/generator";

const toolWorkFlowStep = {
  version: 0.5,
  nodes: {
    passthrough: { value: {} },
    llmCallWithTools: {
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
    // case1. return just messages
    justTextMessagesResult: {
      unless: ":llmCallWithTools.tool.id",
      agent: "pushAgent",
      params: {
        arrayKey: "messages",
      },
      inputs: {
        array: ":messages",
        items: [":userInput.message", { role: "assistant", content: ":llmCallWithTools.message.content" }],
      },
    },
    // 
    llmToolAgentCallMap: {
      if: ":llmCallWithTools.tool_calls",
      agent: "mapAgent",
      inputs: {
        rows: ":llmCallWithTools.tool_calls",
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
            agent: ({ passthrough, agentName }: { passthrough: Record<string, unknown>; agentName: string }) => {
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
          toolCallAgent: {
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
              content: ":toolCallAgent.content",
            },
          },
        },
      },
    },
    // tools response if hasNext in response.
    toolsMessage: {
      agent: "pushAgent",
      inputs: {
        array: [":userInput.message", ":llmCallWithTools.message"],
        items: ":llmToolAgentCallMap.message",
      },
    },
    tool_call_response: {
      agent: "nestedAgent",
      inputs: {
        toolsAgentResponse: ":llmToolAgentCallMap.toolCallAgent",
        llmAgent: ":llmAgent",
        toolsMessages: ":toolsMessage.array",
      },
      graph: {
        nodes: {
          hasNext: {
            agent: (namedInputs: { array: { hasNext: boolean }[] }) => {
              return namedInputs.array.some((ele) => ele.hasNext);
            },
            inputs: {
              array: ":toolsAgentResponse",
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
            inputs: { messages: ":toolsMessages" },
          },
          toolsResponseMessages: {
            agent: "pushAgent",
            inputs: {
              array: ":toolsMessages",
              item: ":toolsResponseLLM.message",
            },
          },
          skipToolsResponseLLM: {
            unless: ":hasNext",
            agent: "copyAgent",
            inputs: {
              array: ":toolsMessages",
            },
          },
          choiceToolsResponse: {
            isResult: true,
            agent: "arrayFindFirstExistsAgent",
            anyInput: true,
            inputs: {
              array: [":toolsResponseMessages.array", ":skipToolsResponseLLM.array"],
            },
          },
        },
      },
    },
    mergedData: {
      inputs: {
        data: ":llmToolAgentCallMap.toolCallAgent",
        tool_calls: ":llmCallWithTools.tool_calls",
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
    toolsResult: {
      agent: "pushAgent",
      params: {
        arrayKey: "messages",
      },
      inputs: {
        array: ":messages",
        items: ":tool_call_response.choiceToolsResponse",
        data: ":mergedData",
      },
    },
    result: {
      isResult: true,
      anyInput: true,
      agent: "arrayFindFirstExistsAgent",
      inputs: { array: [":justTextMessagesResult", ":toolsResult"] },
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
