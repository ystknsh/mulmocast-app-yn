<template>
  <div class="space-y-4">
    <!-- Chat history -->
    <div class="bg-white border rounded-lg p-4 h-80 overflow-y-auto space-y-4">
      <!-- AI's first message -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot :size="16" class="text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-100 text-gray-800 p-3 rounded-lg inline-block max-w-md">
            <p class="text-sm">Let's create scripts through conversation with AI Assistants</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">14:30</p>
        </div>
      </div>

      <!-- User's message -->
      <div class="flex items-start space-x-3 flex-row-reverse space-x-reverse">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <User :size="16" class="text-white" />
        </div>
        <div class="flex-1 text-right">
          <div class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-md">
            <p class="text-sm">AIについてのポッドキャストを作りたいです</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">14:31</p>
        </div>
      </div>

      <!-- AI's response -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot :size="16" class="text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-100 text-gray-800 p-3 rounded-lg inline-block max-w-md">
            <p class="text-sm">
              素晴らしいですね！AIポッドキャストについて、どのような聴衆を想定していますか？初心者向けですか、それとも技術者向けでしょうか？
            </p>
          </div>
          <p class="text-xs text-gray-500 mt-1">14:31</p>
        </div>
      </div>

      <!-- User's response -->
      <div class="flex items-start space-x-3 flex-row-reverse space-x-reverse">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <User :size="16" class="text-white" />
        </div>
        <div class="flex-1 text-right">
          <div class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-md">
            <p class="text-sm">初心者向けで、15分程度の長さにしたいです</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">14:32</p>
        </div>
      </div>

      <!-- AI's latest response -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot :size="16" class="text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-100 text-gray-800 p-3 rounded-lg inline-block max-w-md">
            <p class="text-sm">完璧です！初心者向けのAIポッドキャスト（15分）のMulmoScriptを作成します。</p>
          </div>
          <p class="text-xs text-gray-500 mt-1">14:33</p>
        </div>
      </div>
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

const message = ref("");
const selectedTemplate = ref("solo-with-images");
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: center;
}
</style>
