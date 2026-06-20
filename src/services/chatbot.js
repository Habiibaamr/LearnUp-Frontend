import { apiClient } from "./apiClient.js";

const getSessionId = (session) => Number(session?.session_id ?? session?.id);

const normalizeMessage = (message, index = 0) => ({
  id: message?.id ?? `${message?.sender_type || message?.sender || "message"}-${index}`,
  sender: String(message?.sender_type || message?.sender || "").toLowerCase() === "user"
    ? "user"
    : "bot",
  meta: message?.created_at
    ? new Date(message.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "",
  text: String(message?.message_text || message?.text || message?.assistant_response || ""),
});

export async function listChatSessions() {
  const response = await apiClient.get("/chat/my-sessions");
  return (Array.isArray(response) ? response : response?.sessions || [])
    .map((session) => ({
      ...session,
      session_id: getSessionId(session),
    }))
    .filter((session) => session.session_id);
}

export async function startChatSession() {
  const response = await apiClient.post("/chat/start", {});
  const sessionId = getSessionId(response);

  if (!sessionId) {
    throw new Error("The chat service did not return a session.");
  }

  return sessionId;
}

export async function getChatMessages(sessionId) {
  const response = await apiClient.get(`/chat/${sessionId}/messages`);
  const rows = Array.isArray(response) ? response : response?.messages || [];

  return rows.map(normalizeMessage);
}

export async function sendChatMessage(sessionId, message) {
  const response = await apiClient.post(`/chat/${sessionId}/message`, { message });

  return {
    sessionId: getSessionId(response) || sessionId,
    assistantMessage: normalizeMessage({
      id: `assistant-${Date.now()}`,
      sender_type: "assistant",
      message_text: response?.assistant_response || response?.message || response?.response,
    }),
  };
}
