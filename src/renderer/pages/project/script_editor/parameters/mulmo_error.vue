<template>
  <div
    v-if="mulmoError && mulmoError.length > 0"
    class="mt-2 w-full rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive"
  >
    <div v-for="(message, key) in mulmoError" :key="key">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mulmoError: string[];
}>();
</script>
