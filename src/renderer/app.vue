<template>
  <Toaster richColors />
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useMulmoEventStore, useGraphAIDebugLogStore, useZodErrorStore } from "./store";
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
import type { MulmoProgressLog } from "@/types";
import type { SessionProgressEvent } from "mulmocast/browser";

import { notifyError } from "@/lib/notification";

export default defineComponent({
  components: {
    Toaster,
  },
  setup() {
    const mulmoEventStore = useMulmoEventStore();
    const graphAIDebugStore = useGraphAIDebugLogStore();
    const zodErrorStore = useZodErrorStore();

    onMounted(() => {
      window.electronAPI.onProgress(async (_event, message) => {
        if (message.type === "mulmo") {
          mulmoEventStore.mulmoLogCallback(message as MulmoProgressLog<SessionProgressEvent>);
        }
        if (message.type === "graphai") {
          graphAIDebugStore.graphaiLogCallback(message);
        }
        if (message.type === "error") {
          const errorData = message.data as { message?: string };
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
