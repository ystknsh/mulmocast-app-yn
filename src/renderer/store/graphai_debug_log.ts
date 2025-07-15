import { ref } from "vue";
import { defineStore } from "pinia";

export const useGraphAIDebugLogStore = defineStore("graphaiDebugLog", () => {
  const graphaiDebugLog = ref<Record<string, unknown[]>>({});

  const graphaiLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!graphaiDebugLog.value[projectId]) {
      graphaiDebugLog.value[projectId] = [];
    }
    graphaiDebugLog.value[projectId].push(data);
  };

  return {
    graphaiDebugLog,
    graphaiLogCallback,
  };
});
