<template>
  <div class="flex flex-col gap-4">
    <router-link :to="`/project/${project.metadata.id}`" v-for="project in projects" :key="project.metadata.id">
      <div
        class="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              <template v-if="thumbnailsLoading[project.metadata.id]">
                <Skeleton class="h-full w-full" />
              </template>
              <template v-else-if="projectThumbnails[project.metadata.id]">
                <img
                  :src="mediaUri(projectThumbnails[project.metadata.id])"
                  class="h-full w-full object-contain"
                  :alt="project?.script?.title || INITIAL_TITLE"
                />
              </template>
              <template v-else>
                <FileText class="h-6 w-6 text-green-500" />
              </template>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-semibold text-gray-900">{{ project?.script?.title || INITIAL_TITLE }}</h3>
              </div>
              <div class="mt-1 flex items-center space-x-1 text-sm text-gray-500">
                <Calendar class="h-4 w-4" />
                <span>{{ formatDate(project.metadata.updatedAt || project.metadata.createdAt) }}</span>
                <span class="rounded bg-gray-100 px-2 py-1 text-xs">
                  {{ project.metadata.version }}
                </span>
                <div
                  v-if="mulmoEventStore.isGenerating(project.metadata.id)"
                  class="inline-flex items-center space-x-1 rounded bg-blue-100 px-2 py-1"
                >
                  <Loader2 class="h-3 w-3 animate-spin text-blue-500" />
                  <span class="text-xs font-medium text-blue-600">Generating</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Button
              @click="viewProject($event, project)"
              variant="ghost"
              size="icon"
              class="text-gray-400 hover:text-blue-600"
            >
              <Eye class="h-5 w-5" />
            </Button>
            <Button
              @click.stop.prevent="deleteProject($event, project)"
              variant="ghost"
              size="icon"
              class="text-gray-400 hover:text-red-600"
            >
              <Trash2 class="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Trash2, Eye, Calendar, Loader2, FileText } from "lucide-vue-next";
import type { Project } from "@/lib/project_api";
import { formatDate, mediaUri } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMulmoEventStore } from "@/store/mulmo_event";
import { Skeleton } from "@/components/ui/skeleton";
import { INITIAL_TITLE } from "../../../shared/constants";

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

const deleteProject = (event: MouseEvent, project: Project) => {
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
