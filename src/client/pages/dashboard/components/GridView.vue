<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="item in items"
      :key="item.id"
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
    >
      <div class="aspect-video bg-gray-100 relative overflow-hidden">
        <template v-if="item.type === 'video'">
          <!-- Video Preview -->
          <video
            class="w-full h-full object-cover"
            :poster="item.thumbnail?.replace('w=200&h=150', 'w=400&h=300')"
            preload="metadata"
            @mouseenter="
              (e) => {
                const video = e.target as HTMLVideoElement;
                video.currentTime = 5;
              }
            "
          >
            <source :src="item.videoUrl" type="video/mp4" />
          </video>
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
          >
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <RouterLink :to="`/project/${item.id}`">
                <button class="p-2 bg-white bg-opacity-90 text-gray-700 hover:bg-white rounded-full transition-colors">
                  <Eye class="w-4 h-4" />
                </button>
              </RouterLink>
              <button
                class="p-2 bg-white bg-opacity-90 text-gray-700 hover:bg-white rounded-full transition-colors"
                @click.prevent="toggleVideoPlay($event)"
              >
                <Play class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- Audio Speaker Icon -->
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <button
              @click.prevent="$emit('play-audio', item.id, item.audioUrl!)"
              class="p-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Pause v-if="playingAudio === item.id" class="w-12 h-12 text-blue-600" />
              <Volume2 v-else class="w-12 h-12 text-blue-600" />
            </button>
          </div>
          <div v-if="playingAudio === item.id" class="absolute bottom-2 left-2 right-2">
            <div class="bg-white bg-opacity-90 rounded-full px-3 py-1 text-xs text-center">Playing...</div>
          </div>
        </template>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 text-sm truncate">
            {{ item.title }}
          </h3>
          <div class="flex items-center space-x-1 flex-shrink-0 ml-2">
            <Volume2 v-if="item.type === 'audio'" class="w-4 h-4 text-blue-600" />
            <Activity v-if="item.sessionActive" class="w-4 h-4 text-green-500" />
            <AlertTriangle v-if="item.hasErrors" class="w-4 h-4 text-red-500" />
          </div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <Calendar class="w-3 h-3" />
            <span>{{ item.date }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span v-if="item.sessionActive" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Generating
            </span>
            <span v-if="item.hasErrors" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"> Error </span>
            <span class="px-2 py-1 bg-gray-100 rounded">
              {{ item.type === "video" ? "Video" : "Audio" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Play, Eye, Calendar, Volume2, Pause, Activity, AlertTriangle } from "lucide-vue-next";

type Item = {
  id: number;
  title: string;
  type: "video" | "audio";
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  date: string;
  sessionActive: boolean;
  hasErrors: boolean;
};

defineProps<{
  items: Item[];
  playingAudio: number | null;
}>();

defineEmits<{
  "play-audio": [itemId: number, audioUrl: string];
}>();

const toggleVideoPlay = (event: MouseEvent) => {
  const video = (event.currentTarget as HTMLElement)
    .closest(".aspect-video")
    ?.querySelector("video") as HTMLVideoElement;
  if (video) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
};
</script>
