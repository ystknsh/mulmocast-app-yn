<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <button
              class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus class="w-5 h-5" />
              <span>Create New</span>
            </button>
            <div class="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600',
                ]"
              >
                <List class="w-5 h-5" />
              </button>
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600',
                ]"
              >
                <Grid class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-500">{{ items.length }} projects</div>
        </div>

        <ListView v-if="viewMode === 'list'" :items="items" />
        <GridView v-else :items="items" :playing-audio="playingAudio" @play-audio="handleAudioPlay" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Grid, List, Plus } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import ListView from "./components/ListView.vue";
import GridView from "./components/GridView.vue";

const viewMode = ref<"list" | "grid">("list");
const playingAudio = ref<number | null>(null);

// Sample data for projects
const items = [
  {
    id: 1,
    title: "Product Demo Video",
    type: "video" as const,
    thumbnail:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    date: "2024-05-20",
    sessionActive: true,
    hasErrors: false,
  },
  {
    id: 2,
    title: "Tech Talk Podcast",
    type: "audio" as const,
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    date: "2024-05-19",
    sessionActive: false,
    hasErrors: false,
  },
  {
    id: 3,
    title: "Company Presentation",
    type: "video" as const,
    thumbnail:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    date: "2024-05-18",
    sessionActive: true,
    hasErrors: true,
  },
  {
    id: 4,
    title: "Weekly Podcast Episode #15",
    type: "audio" as const,
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    date: "2024-05-17",
    sessionActive: false,
    hasErrors: false,
  },
  {
    id: 5,
    title: "Marketing Campaign Video",
    type: "video" as const,
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=150",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    date: "2024-05-16",
    sessionActive: false,
    hasErrors: false,
  },
  {
    id: 6,
    title: "Daily News Podcast",
    type: "audio" as const,
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    date: "2024-05-15",
    sessionActive: false,
    hasErrors: false,
  },
];

const handleAudioPlay = (__itemId: number, __audioUrl: string) => {
  // TODO: implement audio play
};
</script>
