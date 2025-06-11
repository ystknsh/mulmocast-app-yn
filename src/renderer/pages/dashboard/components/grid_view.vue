<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="project in projects"
      :key="project.id"
      @click="openProject(project)"
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
    >
      <div class="aspect-video bg-gray-100 relative overflow-hidden">
        <!-- Audio/Podcast/Presentation Icon -->
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
          <div class="p-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <FileText class="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 text-sm truncate">
            {{ project.title }}
          </h3>
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
              {{ project.version }}
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
import { Calendar, FileText, Trash2 } from "lucide-vue-next";
import type { Project } from "@/lib/project_api";
import { formatDate } from "@/lib/utils";
const emit = defineEmits<{
  open: [project: Project];
  delete: [project: Project];
}>();

defineProps<{
  projects: Project[];
}>();

const openProject = (project: Project) => {
  emit("open", project);
};

const deleteProject = (project: Project) => {
  emit("delete", project);
};
</script>
