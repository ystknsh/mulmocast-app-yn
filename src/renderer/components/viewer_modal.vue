<template>
  <Dialog :open="!!globalStore.mulmoViewerProjectId" @update:open="globalStore.setMulmoViewerProjectId(null)">
    <DialogContent class="max-h-[90vh] max-w-3xl">
      <div class="sr-only">
        <DialogTitle>{{ t("viewer.mulmo.modal.dialogTitle") }}</DialogTitle>
        <DialogDescription>{{ t("viewer.mulmo.modal.dialogDescription") }}</DialogDescription>
      </div>
      <MulmoViewer
        v-if="selectedProject"
        :project="selectedProject"
        :mulmoViewerActiveTab="selectedProject?.metadata?.mulmoViewerActiveTab"
        @update:mulmoViewerActiveTab="handleUpdateMulmoViewerActiveTab"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MulmoViewer from "@/components/mulmo_viewer/mulmo_viewer.vue";

import { MulmoViewerTab } from "../../shared/constants";

import { projectApi, type Project } from "@/lib/project_api";
import { useMulmoGlobalStore } from "@/store";

const globalStore = useMulmoGlobalStore();
const { t } = useI18n();

const selectedProject = ref<Project | null>(null);

const handleUpdateMulmoViewerActiveTab = async (tab: MulmoViewerTab) => {
  if (selectedProject.value) {
    selectedProject.value.metadata.mulmoViewerActiveTab = tab;
    await projectApi.saveProjectMetadata(selectedProject.value.metadata.id, selectedProject.value.metadata);
  }
};

watch(
  () => globalStore.mulmoViewerProjectId,
  async (v) => {
    if (v) {
      const metadata = await projectApi.getProjectMetadata(v);
      const script = await projectApi.getProjectMulmoScript(v);
      selectedProject.value = {
        metadata,
        script,
      };
    }
  },
);
</script>
