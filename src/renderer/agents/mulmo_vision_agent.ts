import { type AgentFunctionInfo, type AgentFunction } from "graphai";
import { tools } from "mulmocast-vision/lib/tools";

const mulmoVisionTools = tools.map(
  (tool: { function: { name: string; parameters: { properties: Record<string, unknown> } } }) => {
    const { name } = tool.function;
    tool.function.parameters.properties.talkTrack = {
      type: "string",
      description: "What the presenter will say for this slide (1–3 sentences).",
    };

    return { type: "function", function: { ...tool.function, name: "mulmoVisionAgent--" + name } };
  },
);

const normalizeName = (name: string): string => {
  if (name.startsWith("create")) {
    const trimmed = name.slice("create".length);
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }
  return name;
};

const mulmoVisionAgent: AgentFunction = async ({ namedInputs }) => {
  const { arg, func } = namedInputs;
  const { talkTrack } = arg;

  const beat = {
    id: crypto.randomUUID(),
    speaker: "Presenter",
    text: talkTrack ?? "",
    image: {
      type: "vision",
      style: normalizeName(func),
      data: arg,
    },
  };

  return {
    content: "ok",
    data: beat,
  };
};

export const mulmoVisionAgentInfo: AgentFunctionInfo = {
  name: "mulmoVisionAgent",
  agent: mulmoVisionAgent,
  mock: mulmoVisionAgent,
  samples: [
    {
      params: {},
      inputs: {},
      result: {},
    },
  ],
  tools: mulmoVisionTools,
  description: "generate mulmo script json data from prompt messages",
  category: ["net"],
  author: "Receptron team",
  repository: "https://github.com/receptron/mulmocast-app",
  license: "MIT",
};

export default mulmoVisionAgentInfo;
