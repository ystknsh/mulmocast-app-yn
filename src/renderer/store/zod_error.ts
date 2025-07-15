import { ref } from "vue";
import { defineStore } from "pinia";

export const useZodErrorStore = defineStore("zodError", () => {
  const zodError = ref<Record<string, unknown[]>>({});

  const zodErrorLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!zodError.value[projectId]) {
      zodError.value[projectId] = [];
    }
    zodError.value[projectId].push(data);
  };

  return {
    zodError,
    zodErrorLogCallback,
  };
});
