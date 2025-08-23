<template>
  <Toaster richColors expand />
  <div>
    <router-view />
    <SettingModal />
    <ViewerModal />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useMulmoEventStore, useGraphAIDebugLogStore, useZodErrorStore, useMulmoGlobalStore } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import SettingModal from "@/components/setting_modal.vue";
import ViewerModal from "@/components/viewer_modal.vue";
import { useTheme } from "@/composables/use-theme";

import "vue-sonner/style.css";
import type { MulmoProgressLog } from "@/types";
import type { SessionProgressEvent } from "mulmocast/browser";

import { notifyError } from "@/lib/notification";

export default defineComponent({
  components: {
    Toaster,
    SettingModal,
    ViewerModal,
  },
  setup() {
    const mulmoEventStore = useMulmoEventStore();
    const graphAIDebugStore = useGraphAIDebugLogStore();
    const zodErrorStore = useZodErrorStore();
    const globalStore = useMulmoGlobalStore();
    
    // Initialize theme
    useTheme();

    onMounted(async () => {
      try {
        const settings = await window.electronAPI.settings.get();
        if (settings) {
          globalStore.updateSettings(settings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }

      window.electronAPI.onProgress(async (_event, message) => {
        if (message.type === "mulmo") {
          mulmoEventStore.mulmoLogCallback(message as MulmoProgressLog<SessionProgressEvent>);
        }
        if (message.type === "graphai") {
          graphAIDebugStore.graphaiLogCallback(message);
        }
        if (message.type === "error") {
          const errorData = message.data as { message?: string };
          console.log(errorData);
          if (errorData?.message) {
            notifyError("Error", errorData.message);
          }
        }

        if (message.type === "zod_error") {
          zodErrorStore.zodErrorLogCallback(message);
        }
      });
    });
  },
});
</script>
