<template>
  <div class="space-y-4">
    <!-- Chat history -->
    <div class="bg-white border rounded-lg p-4 h-80 overflow-y-auto space-y-4">
      <!-- AI's first message -->
      <BotMessage message="Let's create scripts through conversation with AI Assistants" time="14:30" />
      <!-- User's message -->
      <UserMessage message="AIについてのポッドキャストを作りたいです" time="14:31" />

      <!-- AI's response -->
      <BotMessage message="素晴らしいですね！AIポッドキャストについて、どのような聴衆を想定していますか？初心者向けですか、それとも技術者向けでしょうか？" time="14:31" />
      
      <!-- User's response -->
      <UserMessage message="初心者向けで、15分程度の長さにしたいです" time="14:32" />

      <!-- AI's latest response -->
      <BotMessage message="完璧です！初心者向けのAIポッドキャスト（15分）のMulmoScriptを作成します。" time="14:33" />
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
            v-model="message"
            placeholder="ex) Thank you very much! Please proceed with the creation."
            class="flex-1 border-none outline-none px-3 py-2 text-sm bg-transparent min-w-0"
          />
          <Button size="sm" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 m-1 rounded-md">
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

import BotMessage from "./BotMessage.vue";
import UserMessage from "./UserMessage.vue";

const message = ref("");
const selectedTemplate = ref("solo-with-images");
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: center;
}
</style>
