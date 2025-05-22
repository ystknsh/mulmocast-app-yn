<template>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
  <div>
    <button @click="hello">test</button>
  </div>
</template>

<script setup>
console.log('👋 This message is being logged by "App.vue", included via Vite');

const hello = async () => {


  console.log("HELLO");
  const url = "http://localhost:8085/test";
  const data = {};
  const response = await fetch(url, {
    method: 'POST', 
    headers: { 
    'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(await response.json());
};
</script>
