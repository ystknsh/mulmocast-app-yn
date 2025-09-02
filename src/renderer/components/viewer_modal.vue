<template>
  <Dialog :open="!!globalStore.mulmoViewerProjectId" @update:open="globalStore.setMulmoViewerProjectId(null)">
    <DialogContent class="!top-8 max-h-[95vh] max-w-full !translate-y-0">
      <div class="sr-only">
        <DialogTitle>{{ t("viewer.mulmo.modal.dialogTitle") }}</DialogTitle>
        <DialogDescription>{{ t("viewer.mulmo.modal.dialogDescription") }}</DialogDescription>
      </div>
      <div class="max-h-[90vh] overflow-y-auto">
        <MulmoViewer
          v-if="selectedProject"
          :project-id="selectedProject?.metadata?.id"
          :project="selectedProject"
          :mulmoMultiLinguals="mulmoMultiLinguals"
          @updateMultiLingual="updateMultiLingual"
          class="max-h-full"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MulmoViewer from "@/components/mulmo_viewer/mulmo_viewer.vue";

import { projectApi, type Project } from "@/lib/project_api";
import { useMulmoGlobalStore } from "@/store";

const globalStore = useMulmoGlobalStore();
const { t } = useI18n();

const selectedProject = ref<Project | null>(null);

const mulmoMultiLinguals = ref({});

const updateMultiLingual = async () => {
  mulmoMultiLinguals.value = await window.electronAPI.mulmoHandler(
    "mulmoMultiLinguals",
    globalStore.mulmoViewerProjectId,
  );
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
      updateMultiLingual();
    }
  },
);
</script>
