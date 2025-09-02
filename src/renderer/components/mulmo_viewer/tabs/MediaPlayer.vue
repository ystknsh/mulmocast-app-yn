
<template>
  <div>
    <div v-if="videoWithAudioSource">
      1
      <video :src="videoWithAudioSource" controls />
    </div>
    <div v-else-if="videoSource">
      2
      <video :src="videoSource" ref="videoRef" controls
             @play="handleVideoPlay"
             @pause="handleVideoPause"
             @ended="handleVideoEnded"
             />
      <audio :src="audioSource" ref="audioRef" v-if="audioSource" />
    </div>
    <div v-else-if="audioSource">
      3
      <video :src="audioSource" :poster="imageSource" controls />
    </div>
    <div v-else-if="imageSource">
      4
      <img :src="imageSource" ref="imageRef" />
    </div>
    <div v-else>
      no media
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
interface Props {
  videoWithAudioSource?: string;
  videoSource?: string;
  imageSource?: string;
  audioSource?: string;
}
const props = defineProps<Props>();

const imageRef = ref();
const audioRef= ref();
const videoRef= ref();

if (audioRef.value && videoRef.value) {
}

const handleVideoPlay = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = videoRef.value.currentTime;
    console.log( audioRef.value.currentTime ,  videoRef.value.currentTime);
    if (audioRef.value.currentTime === videoRef.value.currentTime) {
      audioRef.value.play();
    }
  }
};
const handleVideoPause = () => {

};
const handleVideoEnded = () => {

};


</script>


