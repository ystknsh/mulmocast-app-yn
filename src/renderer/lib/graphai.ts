import { ref, computed } from "vue";
import { TransactionLog } from "graphai";
import { eventAgentGenerator, EventData } from "@receptron/event_agent_generator";
import { ChatMessage } from "@/types";

export const textInputEvent = () => {
  const userInput = ref("");

  const eventsObj = ref<Record<string, EventData>>({});
  const { eventAgent } = eventAgentGenerator((id, data) => {
    eventsObj.value[id] = data;
  });
  const submitText = (event: EventData) => {
    const data = {
      text: userInput.value,
      message: { role: "user", content: userInput.value },
    };
    event.onEnd(data);
    delete eventsObj.value[event.id];
    userInput.value = "";
  };
  const events = computed(() => {
    return Object.values(eventsObj.value);
  });

  return {
    eventAgent,
    userInput,
    events,
    submitText,
  };
};

export const useChatPlugin = (initialMessages: ChatMessage[], updateCallback: (messages: ChatMessage[]) => void) => {
  const messages = ref<ChatMessage[]>(initialMessages);
  const chatMessagePlugin = (targetNodeId: string[]) => {
    return (log: TransactionLog) => {
      const { nodeId, state, result } = log;
      if (targetNodeId.includes(nodeId) && state === "completed" && result) {
        messages.value.push((result as { message: ChatMessage }).message);
        updateCallback(messages.value);
      }
    };
  };
  return {
    messages,
    chatMessagePlugin,
  };
};
