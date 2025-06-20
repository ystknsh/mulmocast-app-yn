<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "./store";

export default defineComponent({
  setup() {
    const store = useStore();

    onMounted(() => {
      window.electronAPI.onProgress(async (event, message) => {
        if (message.type === "mulmo") {
          store.mulmoLogCallback(message);
        }
        if (message.type === "graphai") {
          store.graphaiLogCallback(message);
        }
      });
    });
  },
});
</script>
