import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { MulmoProgressLog } from "../../types";
import type { SessionType, BeatSessionType, SessionProgressEvent, MulmoScript } from "mulmocast/browser";

import cloneDeep from "clone-deep";
import deepEqual from "deep-equal";

type SessionStateEntry = Record<SessionType, boolean>;
type BeatSessionStateEntry = Record<BeatSessionType, Record<number, boolean>>;

type SessionState = Record<string, { beat: BeatSessionStateEntry; artifact: SessionStateEntry }>;

export const useStore = defineStore("store", () => {
  const mulmoEvent = ref<Record<string, SessionProgressEvent>>({});
  const sessionState = ref<SessionState>({});
  const zodError = ref<Record<string, unknown[]>>({});

  const graphaiDebugLog = ref<Record<string, unknown[]>>({});

  // for history
  const index = ref(0);
  const histories = ref<{ data: MulmoScript; name: string }[]>([]);
  const currentMulmoScript = ref<MulmoScript | null>(null);
  const updateMulmoScript = (data: MulmoScript) => {
    currentMulmoScript.value = data;
  };

  const initMulmoScript = (data: MulmoScript) => {
    currentMulmoScript.value = data;
    index.value = 0;
    pushDataToHistory("init", data);
  };

  const updateMulmoScriptAndPushToHistory = (data: MulmoScript) => {
    currentMulmoScript.value = data;
    pushDataToHistory("push", data);
  };

  const pushDataToHistory = (name: string, data: MulmoScript) => {
    // don't call directory.
    if (index.value > 0 && deepEqual(histories.value[index.value - 1].data, data)) {
      console.log("equal");
      return;
    }
    console.log("push history");
    histories.value.length = index.value;
    histories.value.push({ data: cloneDeep(data), name });
    index.value = index.value + 1;
  };
  // history api
  const undoable = computed(() => {
    return index.value > 1;
  });
  const undo = () => {
    if (undoable.value) {
      console.log("UNDO");
      currentMulmoScript.value = histories.value[index.value - 2].data;
      index.value = index.value - 1;
    }
  };

  const redoable = computed(() => {
    return index.value < histories.value.length;
  });
  const redo = () => {
    if (redoable.value) {
      console.log("REDO");
      currentMulmoScript.value = histories.value[index.value].data;
      index.value = index.value + 1;
    }
  };
  // end of history

  const mulmoLogCallback = (log: MulmoProgressLog<SessionProgressEvent>) => {
    const { projectId, data } = log;
    const { kind, sessionType, inSession } = data;
    mulmoEvent.value[projectId] = data;
    if (!sessionState.value[projectId]) {
      sessionState.value[projectId] = {
        artifact: {
          audio: false,
          image: false,
          video: false,
          multiLingual: false,
          caption: false,
          pdf: false,
        },
        beat: {
          audio: {},
          image: {},
          multiLingual: {},
          caption: {},
          movie: {},
          html: {},
          imageReference: {},
        },
      };
    }
    if (kind === "session") {
      sessionState.value[projectId]["artifact"][sessionType] = inSession;
    }
    if (kind === "beat") {
      sessionState.value[projectId]["beat"][sessionType][data.index] = inSession;
    }
  };
  const graphaiLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!graphaiDebugLog.value[projectId]) {
      graphaiDebugLog.value[projectId] = [];
    }
    graphaiDebugLog.value[projectId].push(data);
  };
  const zodErrorLogCallback = (log: { projectId: string; data: unknown }) => {
    const { projectId, data } = log;
    if (!zodError.value[projectId]) {
      zodError.value[projectId] = [];
    }
    zodError.value[projectId].push(data);
  };

  const isArtifactGenerating = computed(() => {
    return Object.keys(sessionState.value).reduce((tmp: Record<string, boolean>, projectId) => {
      tmp[projectId] = Object.values(sessionState.value[projectId]["artifact"]).some((state) => state);
      return tmp;
    }, {});
  });
  const isBeatGenerating = computed(() => {
    return Object.keys(sessionState.value).reduce((tmp: Record<string, boolean>, projectId) => {
      tmp[projectId] = Object.values(sessionState.value[projectId]["beat"]).some((sessionState) => {
        return Object.values(sessionState).some((value) => value);
      }, {});
      return tmp;
    }, {});
  });

  return {
    mulmoEvent,
    mulmoLogCallback,
    sessionState,

    graphaiDebugLog,
    graphaiLogCallback,

    zodErrorLogCallback,
    zodError,

    isArtifactGenerating,
    isBeatGenerating,

    currentMulmoScript,
    initMulmoScript,
    updateMulmoScript,
    updateMulmoScriptAndPushToHistory,

    undoable,
    undo,
    redoable,
    redo,
  };
});
