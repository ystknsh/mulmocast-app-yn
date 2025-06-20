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

type SessionState = Record<string, SessionStateEntry>;
type BeatSessionState = Record<string, BeatSessionStateEntry>;

export const useStore = defineStore("store", () => {
  const mulmoLog = ref<Record<string, MulmoProgressLog[]>>({});

  const sessionState = ref<SessionState>({});
  const beatSessionState = ref<BeatSessionState>({});

  const graphaiDebugLog = ref<Record<string, unknown[]>>({});

  const mulmoLogCallback = (log: MulmoProgressLog<SessionProgressEvent>) => {
    const { projectId, data } = log;
    const { kind, sessionType, inSession } = data;
    if (kind === "session") {
      if (!sessionState.value[projectId]) {
        sessionState.value[projectId] = {
          audio: false,
          image: false,
          video: false,
          multiLingual: false,
          caption: false,
          pdf: false,
        };
      }
      sessionState.value[projectId][sessionType] = inSession;
    }
    if (kind === "beat") {
      if (!beatSessionState.value[projectId]) {
        beatSessionState.value[projectId] = {
          audio: {},
          image: {},
          multiLingual: {},
          caption: {},
          movie: {},
        };
      }
      beatSessionState.value[projectId][sessionType][data.index] = inSession;
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
    mulmoLog,
    mulmoLogCallback,
    sessionState,
    beatSessionState,

    graphaiDebugLog,
    graphaiLogCallback,
  };
});
