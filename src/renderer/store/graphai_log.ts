import { ref } from "vue";
import { defineStore } from "pinia";

export const useGraphAILogStore = defineStore("graphaiLog", () => {
  const graphaiDebugLog = ref<Record<string, unknown[]>>({});
  const zodError = ref<Record<string, unknown[]>>({});

  const graphaiLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!graphaiDebugLog.value[projectId]) {
      graphaiDebugLog.value[projectId] = [];
    }
    graphaiDebugLog.value[projectId].push(data);
  };

  const zodErrorLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!zodError.value[projectId]) {
      zodError.value[projectId] = [];
    }
    zodError.value[projectId].push(data);
  };

  return {
    graphaiDebugLog,
    graphaiLogCallback,
    zodError,
    zodErrorLogCallback,
  };
});
