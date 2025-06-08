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
          <input
            type="text"
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
              v-model="selectedTemplate"
              class="template-dropdown border-2 border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200"
            >
              <option value="solo-with-images">一人でプレゼン。画像生成あり。imagePromptなし</option>
              <option value="dialogue-custom-images">二人の会話。画像生成あり。imagePromptあり。</option>
              <option value="storytelling">一人で読む物語（紙芝居、絵本）</option>
              <option value="business-only">ビジネスプレゼン（画像生成なし）</option>
            </select>
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
import { ref } from "vue";
import { Bot, User, Send } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

import { GraphAI } from "graphai";
import { useStreamData } from "@/lib/stream";
import { textInputEvent, useChatPlugin, useLogs } from "@/lib/graphai";

import BotMessage from "./BotMessage.vue";
import UserMessage from "./UserMessage.vue";

import * as agents from "@graphai/vanilla";
import { openAIAgent } from "@graphai/llm_agents";

const message = ref("");
const selectedTemplate = ref("solo-with-images");

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
  graphai.registerCallback(streamPlugin(streamNodes));
  graphai.registerCallback(chatMessagePlugin(outputNodes));
  graphai.registerCallback((log) => {
    console.log(log);
  });
  await graphai.run();
};

run();
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: center;
}
</style>
