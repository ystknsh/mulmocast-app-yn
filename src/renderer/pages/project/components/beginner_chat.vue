<template>
  <div class="space-y-4">
    <!-- Chat history -->
    <div class="bg-white border rounded-lg p-4 h-80 overflow-y-auto space-y-4">
      <div v-for="(message, key) in messages" :key="key">
        <BotMessage :message="message.content" time="14:30" v-if="message.role === 'assistant'" />
        <UserMessage :message="message.content" time="14:30" v-if="message.role === 'user'" />
      </div>
      <BotMessage v-if="isStreaming['llm']" :message="streamData['llm']" time="14:30" />
    </div>

    <!-- Chat input area - Slack-style design -->
    <div class="space-y-4">
      <!-- Message input field -->
      <div class="chat-input-wrapper">
        <label class="text-sm font-medium text-gray-700 mb-2 block"> Enter your message: </label>
        <div
          class="chat-input-container border-2 border-gray-200 rounded-lg bg-white focus-within:border-blue-500 focus-within:border-2 transition-colors duration-200 flex justify-between"
        >
          <textarea
            v-model="userInput"
            :disabled="events.length == 0"
            placeholder="ex) Thank you very much! Please proceed with the creation."
            class="flex-1 border-none outline-none px-3 py-2 text-sm bg-transparent min-w-0"
          />
          <Button
            size="sm"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 m-1 rounded-md"
            @click="submitText(events[0])"
          >
            <Send :size="16" />
          </Button>
        </div>
      </div>

      <!-- Template selection section -->
      <div class="template-section">
        <div class="rounded-lg p-1">
          <label class="text-sm font-medium text-gray-700 mb-3 block">
            To create a script with the content so far, please select a template and press the Create button.
          </label>

          <!-- Template dropdown and create button -->
          <div class="template-dropdown-container flex items-center gap-4">
            <select
              v-model="selectedTemplateFileName"
              class="template-dropdown border-2 border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200"
            >
              <option v-for="(template, k) in templates" :key="k" :value="template.filename">
                {{ template.title }}
              </option>
            </select>
            <Button size="sm" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full" @click="copy">
              Copy
            </Button>
            <Button size="sm" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
              Create Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Send } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

import { GraphAI, GraphData } from "graphai";
import { useStreamData } from "@/lib/stream";
import { textInputEvent, useChatPlugin } from "@/lib/graphai";

import BotMessage from "./bot_message.vue";
import UserMessage from "./user_message.vue";

import * as agents from "@graphai/vanilla";
import { openAIAgent } from "@graphai/llm_agents";
import type { MulmoScriptTemplate } from "mulmocast";

const emit = defineEmits<{
  "update:updateMulmoScript": [value: any];
}>();

const selectedTemplateFileName = ref("");

const graphChat: GraphData = {
  version: 0.5,
  loop: {
    while: ":continue",
  },
  nodes: {
    continue: {
      value: true,
    },
    messages: {
      value: [],
      update: ":reducer.array",
    },
    userInput: {
      agent: "eventAgent",
      params: {
        message: "You:",
        isResult: true,
      },
    },
    llm: {
      agent: "openAIAgent",
      isResult: true,
      params: {
        forWeb: true,
        stream: true,
        isResult: true,
      },
      inputs: { messages: ":messages", prompt: ":userInput.text" },
    },
    output: {
      agent: "stringTemplateAgent",
      inputs: {
        text: "\x1b[32mAgent\x1b[0m: ${:llm.text}",
      },
    },
    json: {
      console: { after: true },
      agent: "copyAgent",
      inputs: {
        json: ":llm.text.codeBlock().jsonParse()",
      },
    },
    reducer: {
      agent: "pushAgent",
      inputs: { array: ":messages", items: [":userInput.message", ":llm.message"] },
    },
  },
};

const streamNodes = ["llm"];
const outputNodes = ["llm", "userInput"];

const { eventAgent, userInput, events, submitText } = textInputEvent();
const { messages, chatMessagePlugin } = useChatPlugin();
const { streamData, streamAgentFilter, streamPlugin, isStreaming } = useStreamData();
const agentFilters = [
  {
    name: "streamAgentFilter",
    agent: streamAgentFilter,
  },
];

const run = async () => {
  const env = await window.electronAPI.getEnv();
  const prompt = await window.electronAPI.mulmoHandler("readTemplatePrompt", "podcast_standard");

  const graphai = new GraphAI(
    graphChat,
    {
      ...agents,
      openAIAgent,
      eventAgent,
    },
    {
      agentFilters,
      config: {
        openAIAgent: {
          apiKey: env.OPENAI_API_KEY,
        },
      },
    },
  );
  // graphai.injectValue("messages", [{ content: prompt, role: "system" }]);
  graphai.registerCallback(streamPlugin(streamNodes));
  graphai.registerCallback(chatMessagePlugin(outputNodes));
  graphai.registerCallback((log) => {
    console.log(log);
    if (log.nodeId === "json" && log.state === "completed") {
      console.log(log.result.json);
      emit("update:updateMulmoScript", log.result.json);
    }
  });
  await graphai.run();
};

// TODO MulmoScriptTemplateFile
const templates = ref<MulmoScriptTemplate & { filename: string }[]>([]);
onMounted(async () => {
  run();
  templates.value = await window.electronAPI.mulmoHandler("getAvailableTemplates");
  selectedTemplateFileName.value = templates.value[0].filename;
});
const selectTemplate = computed(() => {
  return templates.value.find((template) => template.filename === selectedTemplateFileName.value);
});

const copy = async () => {
  // const prompt = await window.electronAPI.mulmoHandler("readTemplatePrompt", "podcast_standard");
  if (selectTemplate.value) {
    userInput.value = selectTemplate.value.systemPrompt;
  }
};
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: center;
}
</style>
