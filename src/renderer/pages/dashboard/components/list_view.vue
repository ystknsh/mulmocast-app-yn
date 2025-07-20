<template>
  <div class="flex flex-col gap-4">
    <router-link :to="`/project/${project.metadata.id}`" v-for="project in projects" :key="project.metadata.id">
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <FileText class="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-semibold text-gray-900">{{ project.metadata.title }}</h3>
                <div v-if="project.metadata.sessionActive" class="flex items-center space-x-1">
                  <Activity class="w-4 h-4 text-green-500" />
                  <span class="text-xs text-green-600 font-medium">Generating...</span>
                </div>
                <div v-if="project.metadata.hasErrors" class="flex items-center space-x-1">
                  <AlertTriangle class="w-4 h-4 text-red-500" />
                  <span class="text-xs text-red-600 font-medium">Error</span>
                </div>
              </div>
              <div class="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                <Calendar class="w-4 h-4" />
                <span>{{ formatDate(project.metadata.updatedAt || project.metadata.createdAt) }}</span>
                <span class="px-2 py-1 bg-gray-100 rounded text-xs">
                  {{ project.metadata.version }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Button variant="ghost" size="icon" class="text-gray-400 hover:text-blue-600">
              <Eye class="w-5 h-5" />
            </Button>
            <Button
              @click.stop="deleteProject(project)"
              variant="ghost"
              size="icon"
              class="text-gray-400 hover:text-red-600"
            >
              <Trash2 class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Trash2, Eye, Calendar, Activity, AlertTriangle, FileText } from "lucide-vue-next";
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
