<template>
  <Tabs default-value="movie" class="max-h-[90vh] w-full">
    <TabsList class="grid w-full grid-cols-4">
      <TabsTrigger value="movie">{{ t("project.productTabs.tabs.movie") }}</TabsTrigger>
      <TabsTrigger value="pdf">{{ t("project.productTabs.tabs.pdf") }}</TabsTrigger>
      <TabsTrigger value="podcast">{{ t("project.productTabs.tabs.podcast") }}</TabsTrigger>
      <TabsTrigger value="slide">{{ t("project.productTabs.tabs.slide") }}</TabsTrigger>
    </TabsList>

    <MovieTab :project-id="projectId" />
    <PdfTab :project-id="projectId" />
    <PodcastTab :project-id="projectId" />
    <SlideTab :project-id="projectId" />
  </Tabs>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieTab from "./tabs/movie_tab.vue";
import PdfTab from "./tabs/pdf_tab.vue";
import PodcastTab from "./tabs/podcast_tab.vue";
import SlideTab from "./tabs/slide_tab.vue";
import type { Project } from "@/lib/project_api";

const { t } = useI18n();

interface Props {
  project: Project;
}

const props = defineProps<Props>();
const projectId = computed(() => props.project?.metadata?.id || "");
</script>
