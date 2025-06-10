<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="project in projects"
      :key="project.name"
      @click="openProject(project)"
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
    >
      <div class="aspect-video bg-gray-100 relative overflow-hidden">
        <template v-if="project.type === 'video'">
          <!-- Video Preview -->
          <video
            class="w-full h-full object-cover"
            :poster="project.thumbnail?.replace('w=200&h=150', 'w=400&h=300')"
            preload="metadata"
            @mouseenter="
              (e) => {
                const video = e.target as HTMLVideoElement;
                video.currentTime = 5;
              }
            "
          >
            <source :src="project.videoUrl" type="video/mp4" />
          </video>
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
          >
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button
                @click.stop="openProject(project)"
                class="p-2 bg-white bg-opacity-90 text-gray-700 hover:bg-white rounded-full transition-colors"
              >
                <Eye class="w-4 h-4" />
              </button>
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
          <!-- Audio/Podcast/Presentation Icon -->
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <button
              v-if="project.type === 'audio' || project.type === 'podcast'"
              @click.prevent="handleAudioPlay(project.id, project.audioUrl!)"
              class="p-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Pause v-if="playingAudio === project.id" class="w-12 h-12 text-blue-600" />
              <Volume2 v-else class="w-12 h-12 text-blue-600" />
            </button>
            <div
              v-else
              class="p-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <FileText class="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div v-if="playingAudio === project.id" class="absolute bottom-2 left-2 right-2">
            <div class="bg-white bg-opacity-90 rounded-full px-3 py-1 text-xs text-center">Playing...</div>
          </div>
        </template>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 text-sm truncate">
            {{ project.title }}
          </h3>
          <div class="flex items-center space-x-1 flex-shrink-0 ml-2">
            <Volume2 v-if="project.type === 'audio' || project.type === 'podcast'" class="w-4 h-4 text-blue-600" />
            <FileText v-if="project.type === 'presentation'" class="w-4 h-4 text-green-600" />
            <Activity v-if="project.sessionActive" class="w-4 h-4 text-green-500" />
            <AlertTriangle v-if="project.hasErrors" class="w-4 h-4 text-red-500" />
          </div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <Calendar class="w-3 h-3" />
            <span>{{ formatDate(project.updatedAt || project.createdAt) }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span v-if="project.sessionActive" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Generating
            </span>
            <span v-if="project.hasErrors" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"> Error </span>
            <span class="px-2 py-1 bg-gray-100 rounded">
              {{
                project.type === "video"
                  ? "Video"
                  : project.type === "audio"
                    ? "Audio"
                    : project.type === "podcast"
                      ? "Podcast"
                      : "Presentation"
              }}
            </span>
          </div>
        </div>
        <div class="flex justify-end mt-2">
          <button
            @click.stop="deleteProject(project)"
            class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Play, Eye, Calendar, Volume2, Pause, Activity, AlertTriangle, FileText, Trash2 } from "lucide-vue-next";
import type { Project } from "@/lib/project_api";
import { formatDate } from "@/lib/utils";
const emit = defineEmits<{
  open: [project: Project];
  delete: [project: Project];
}>();

defineProps<{
  projects: Project[];
}>();

// Local state for audio playing
const playingAudio = ref<number | null>(null);

const openProject = (project: Project) => {
  emit("open", project);
};

const deleteProject = (project: Project) => {
  emit("delete", project);
};

const handleAudioPlay = (__projectId: number, __audioUrl: string) => {
  // TODO: implement audio play functionality
};

const toggleVideoPlay = (__event: MouseEvent) => {
  // TODO: implement video play
};
</script>
