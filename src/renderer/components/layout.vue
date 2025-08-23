<template>
  <div class="bg-background min-h-screen">
    <Header />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from "./header.vue";
</script>
