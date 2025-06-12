import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
  const mulmoLog = ref<Record<string, unknown[]>>({});

  const mulmoLogCallback = (log: { projectId: string }) => {
    const { projectId } = log;
    if (!mulmoLog.value[projectId]) {
      mulmoLog.value[projectId] = [];
    }
    mulmoLog.value[projectId].push(log);
  };
  return {
    mulmoLog,
    mulmoLogCallback,
  };
});
