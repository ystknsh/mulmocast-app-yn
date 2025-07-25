import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import { MulmoScript, mulmoScriptSchema, readTemplatePrompt, validateSchemaAgent } from "mulmocast";
import { openAIAgent } from "@graphai/openai_agent";
import { ChatMessage } from "../../types";

const graphData: GraphData = {
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

export const createMulmoScript = async (messages: ChatMessage[], templateName: string) => {
  // TODO option.config
  const graph = new GraphAI(graphData, {
    ...agents,
    openAIAgent,
    validateSchemaAgent,
  });
  graph.injectValue("chatMessages", messages);
  graph.injectValue("prompt", readTemplatePrompt(templateName));
  // graph.injectValue("systemPrompt", "あなたはツンデレ口調でプレゼン用の日本語スクリプトを生成するAIです。テーマに対して、セリフ口調で、ツッコミや驚き、感情を交えたテンポのよい文体で書いてください。セリフは感情豊かに表現し、リズムや間も工夫してください。ユーモアや親しみやすさを忘れずに！");
  console.log(messages, readTemplatePrompt(templateName));
  const result = await graph.run<{ data: MulmoScript }>();
  return result.mulmoScript.data;
};
