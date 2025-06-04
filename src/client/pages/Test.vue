<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 ml-2">Test Page</h1>
    <div class="space-x-4 ml-2">
      <Button @click="run">Run</Button>
      <Button @click="stream">Stream</Button>
    </div>
    <div class="space-x-4 mt-2 ml-2">
      <Button @click="openFile">File</Button>
      <Button @click="run2">Run2</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";

const filePath = ref<string | undefined>();

const stream = async () => {
  console.log("stream");
  const url = "http://localhost:8085/api/mulmo/123/stream?" + Date.now();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(await response.json());
};

const run = async () => {
  const url = "http://localhost:8085/api/mulmo/123/run";
  const data = {};
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(await response.json());
};

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
