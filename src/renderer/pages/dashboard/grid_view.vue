<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    <router-link :to="`/project/${project.metadata.id}`" v-for="project in projects" :key="project.metadata.id">
      <div
        class="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
      >
        <div class="relative aspect-video overflow-hidden bg-gray-100">
          <template v-if="thumbnailsLoading[project.metadata.id]">
            <Skeleton class="h-full w-full" />
          </template>
          <template v-else-if="projectThumbnails[project.metadata.id]">
            <img
              :src="mediaUri(projectThumbnails[project.metadata.id])"
              class="h-full w-full object-contain"
              :alt="project?.script?.title || t('common.defaultTitle')"
            />
          </template>
          <template v-else>
            <!-- Audio/Podcast/Presentation Icon -->
            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <div
                class="rounded-full bg-white p-8 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
              >
                <FileText class="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </template>
        </div>
        <div class="p-4">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="truncate text-sm font-semibold text-gray-900">
              {{ project?.script?.title ||  t('common.defaultTitle') }}
            </h3>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-1">
              <Calendar class="h-3 w-3" />
              <span>{{ formatDate(project.metadata.updatedAt || project.metadata.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <div
                v-if="mulmoEventStore.isGenerating(project.metadata.id)"
                class="inline-flex items-center space-x-1 rounded bg-blue-100 px-2 py-1"
              >
                <Loader2 class="h-3 w-3 animate-spin text-blue-500" />
                <span class="text-xs font-medium text-blue-600">Generating</span>
              </div>
              <span class="rounded bg-gray-100 px-2 py-1">
                {{ project.metadata.version }}
              </span>
            </div>
          </div>
          <div class="mt-2 flex justify-end space-x-1">
            <Button
              @click="viewProject($event, project)"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-gray-400 hover:text-blue-600"
            >
              <Eye class="h-4 w-4" />
            </Button>
            <Button
              @click="deleteProject($event, project)"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-gray-400 hover:text-red-600"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Calendar, FileText, Trash2, Loader2, Eye } from "lucide-vue-next";
import type { Project } from "@/lib/project_api";
import { formatDate, mediaUri } from "@/lib/utils";
import { Button, Skeleton } from "@/components/ui";
import { useMulmoEventStore } from "@/store/mulmo_event";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits<{
  delete: [project: Project];
  view: [project: Project];
}>();

defineProps<{
  projects: Project[];
  projectThumbnails: Record<string, ArrayBuffer | string | null>;
  thumbnailsLoading: Record<string, boolean>;
}>();

const mulmoEventStore = useMulmoEventStore();

const deleteProject = (event: Event, project: Project) => {
  event.preventDefault();
  event.stopPropagation();
  emit("delete", project);
};

const viewProject = (event: Event, project: Project) => {
  event.preventDefault();
  event.stopPropagation();
  emit("view", project);
};
</script>
