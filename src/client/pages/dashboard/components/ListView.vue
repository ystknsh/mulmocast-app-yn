<template>
  <div class="flex flex-col gap-4">
    <RouterLink v-for="item in items" :key="item.id" :to="`/project/${item.id}`">
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                v-if="item.type === 'video'"
                :src="item.thumbnail"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
              <Volume2 v-else class="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-semibold text-gray-900">{{ item.title }}</h3>
                <Volume2 v-if="item.type === 'audio'" class="w-4 h-4 text-blue-600" />
                <div v-if="item.sessionActive" class="flex items-center space-x-1">
                  <Activity class="w-4 h-4 text-green-500" />
                  <span class="text-xs text-green-600 font-medium">Generating</span>
                </div>
                <div v-if="item.hasErrors" class="flex items-center space-x-1">
                  <AlertTriangle class="w-4 h-4 text-red-500" />
                  <span class="text-xs text-red-600 font-medium">Error</span>
                </div>
              </div>
              <div class="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                <Calendar class="w-4 h-4" />
                <span>{{ item.date }}</span>
                <span class="px-2 py-1 bg-gray-100 rounded text-xs">
                  {{ item.type === "video" ? "Video" : "Audio" }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Eye class="w-5 h-5" />
            </button>
            <button class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Play class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Play, Eye, Calendar, Volume2, Activity, AlertTriangle } from "lucide-vue-next";
import type { Item } from "@/types";

defineProps<{
  items: Item[];
}>();
</script>
