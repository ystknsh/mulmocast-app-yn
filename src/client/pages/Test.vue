<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 ml-2">Test Page</h1>
    <div class="space-x-4 ml-2">
      <Button @click="run">Run</Button>
      <Button @click="stream">Stream</Button>
    </div>
    <div class="space-x-4 mt-2 ml-2">
      <Button @click="openFile">File</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";

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
  const filePath = await window.electronAPI.openFile();
  if (filePath) {
    console.log("Selected file:", filePath);
  }
};
</script>
