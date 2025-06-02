<template>
  <div>
    <nav class="p-4 border-b">
      <router-link to="/" class="mr-4 text-blue-600 hover:text-blue-800"> Home </router-link>
      <router-link to="/test" class="text-blue-600 hover:text-blue-800"> Test </router-link>
    </nav>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// TODO
</script>
