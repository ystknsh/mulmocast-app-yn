<template>
  <div>
    <div v-if="videoWithAudioSource">
      <video
        :src="videoWithAudioSource"
        controls
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        ref="videoWithAudioRef"
      />
    </div>
    <div v-else-if="videoSource">
      <video
        :src="videoSource"
        ref="videoRef"
        controls
        @play="handleVideoPlay"
        @pause="handleVideoPause"
        @ended="handleVideoEnded"
      />
      <audio :src="audioSource" ref="audioSyncRef" v-if="audioSource" />
    </div>
    <div v-else-if="audioSource">
      <video
        :src="audioSource"
        :poster="imageSource ?? mulmoImage"
        controls
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        ref="audioRef"
      />
    </div>
    <div v-else-if="imageSource">
      <img :src="imageSource" ref="imageRef" />
    </div>
    <div v-else>{{ t("ui.common.noMedia") }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
interface Props {
  videoWithAudioSource?: string;
  videoSource?: string;
  imageSource?: string;
  audioSource?: string;
}
defineProps<Props>();

const { t } = useI18n();

const emit = defineEmits(["play", "pause", "ended"]);

const videoWithAudioRef = ref();
const videoRef = ref();
const audioSyncRef = ref();
const audioRef = ref();
const imageRef = ref();

const mulmoImage = "https://github.com/receptron/mulmocast-cli/blob/main/assets/images/mulmocast_credit.png?raw=true";

const handleVideoPlay = () => {
  if (audioSyncRef.value) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
    if (audioSyncRef.value.currentTime === videoRef.value.currentTime) {
      audioSyncRef.value.play();
    }
  }
};
const handleVideoPause = () => {
  if (audioSyncRef.value) {
    audioSyncRef.value.pause();
  }
};
const handleVideoEnded = () => {
  if (audioSyncRef.value) {
    audioSyncRef.value.stop();
  }
};

const handlePlay = () => {
  emit("play");
};

const handlePause = () => {
  emit("pause");
};
const handleEnded = () => {
  emit("ended");
};

const play = () => {
  if (videoWithAudioRef.value) {
    videoWithAudioRef.value.play();
  }
  if (videoRef.value) {
    videoRef.value.play();
  }
  if (audioRef.value) {
    audioRef.value.play();
  }
};
defineExpose({
  play,
});
</script>
