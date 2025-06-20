import { ref } from "vue";
import { defineStore } from "pinia";
import { MulmoProgressLog } from "../../types";

// TODO: import from cli
type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";
type BeatSessionType = "audio" | "image" | "multiLingual" | "caption" | "movie";

type SessionProgressEvent =
  | { kind: "session"; sessionType: SessionType; inSession: boolean }
  | { kind: "beat"; sessionType: BeatSessionType; index: number; inSession: boolean };
// end of TODO

type SessionStateEntry = Record<SessionType, boolean>;
type BeatSessionStateEntry = Record<BeatSessionType, Record<number, boolean>>;

type SessionState = Record<string, { beat: BeatSessionStateEntry; artifact: SessionStateEntry }>;

export const useStore = defineStore("store", () => {
  const mulmoEvent = ref<Record<string, SessionProgressEvent>>({});
  const sessionState = ref<SessionState>({});

  const graphaiDebugLog = ref<Record<string, unknown[]>>({});

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

  return {
    mulmoEvent,
    mulmoLogCallback,
    sessionState,

    graphaiDebugLog,
    graphaiLogCallback,
  };
});
