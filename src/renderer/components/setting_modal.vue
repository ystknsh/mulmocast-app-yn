<template>
  <Dialog :open="globalStore.isOpenSettingModal" @update:open="globalStore.toggleSettingModal">
    <DialogOverlay class="bg-black/10" @click="globalStore.toggleSettingModal" />
    <DialogContent class="h-[80%] w-[80%] max-w-3xl overflow-y-auto rounded-lg border-0 bg-white p-6 shadow-lg">
      <div class="sr-only">
        <DialogTitle>{{ t("viewer.mediaPreview.modal.dialogTitle") }}</DialogTitle>
        <DialogDescription>{{ t("viewer.mediaPreview.modal.dialogDescription") }}</DialogDescription>
      </div>
      <div class="flex h-full items-center justify-center">
        <Settings />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Settings from "@/pages/settings.vue";

import { useMulmoGlobalStore } from "@/store";

const globalStore = useMulmoGlobalStore();
const { t } = useI18n();
</script>
