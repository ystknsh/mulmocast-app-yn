<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 ml-2">Test Page</h1>
    <div class="space-x-4 mt-2 ml-2">
      <Button @click="openFile">File</Button>
      <Button @click="run2">Run2</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";

window.electronAPI.onProgress((event, message) => {
  console.log("update:", message);
});

const filePath = ref<string | undefined>();

const openFile = async () => {
  filePath.value = await window.electronAPI.openFile();
  if (filePath.value) {
    console.log("Selected file:", filePath.value);
  }
};

const run2 = async () => {
  if (filePath.value) {
    await window.electronAPI.mulmoTest({ file: filePath.value });
  }
};
</script>
