<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <router-link :to="`/project/${project.metadata.id}`" v-for="project in projects" :key="project.metadata.id">
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
      >
        <div class="aspect-video bg-gray-100 relative overflow-hidden">
          <!-- Audio/Podcast/Presentation Icon -->
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <div
              class="p-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <FileText class="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-sm truncate">
              {{ project.metadata.title }}
            </h3>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-1">
              <Calendar class="w-3 h-3" />
              <span>{{ formatDate(project.metadata.updatedAt || project.metadata.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span v-if="project.metadata.sessionActive" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Generating
              </span>
              <span v-if="project.metadata.hasErrors" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                Error
              </span>
              <span class="px-2 py-1 bg-gray-100 rounded">
                {{ project.metadata.version }}
              </span>
            </div>
          </div>
          <div class="flex justify-end mt-2">
            <Button
              @click.stop="deleteProject(project)"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-gray-400 hover:text-red-600"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Calendar, FileText, Trash2 } from "lucide-vue-next";
import type { Project } from "@/lib/project_api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
const emit = defineEmits<{
  delete: [project: Project];
}>();

defineProps<{
  projects: Project[];
}>();

const deleteProject = (project: Project) => {
  emit("delete", project);
};
</script>
