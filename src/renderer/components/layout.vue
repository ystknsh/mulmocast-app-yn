<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from "./header.vue";
</script>
