<template>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
  <div>
    <button
      @click="hello"
      class="w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
    >
      test
    </button>
  </div>
</template>

<script setup>
console.log('👋 This message is being logged by "App.vue", included via Vite');

const hello = async () => {
  console.log("HELLO");
  const url = "http://localhost:8085/test";
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
</script>
