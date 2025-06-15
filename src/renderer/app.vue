<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { useStore } from "./store";

export default defineComponent({
  setup() {
    const store = useStore();

    /*
    window.electronAPI.onProgress((event, message) => {
      store.mulmoLogCallback(message);
      console.log("update:", message);
    });
    */
    watch(
      () => store.mulmoLog,
      (a) => {
        console.log(a);
      },
    );
  },
});
</script>
