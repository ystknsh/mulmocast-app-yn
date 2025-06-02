<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Hello from Vue.js!</h1>
    <div class="bg-black text-white text-center mb-4">tailwind</div>
    <Button variant="outline" @click="hello"> Click me </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";

const hello = () => {
  console.log("Hello from Vue!");
};
</script>
