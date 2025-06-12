import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
  const mulmoLog = ref({});

  const mulmoLogCallback = (log) => {
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
