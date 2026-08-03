import { mockChatMessages, mockChatThreads, type ChatMessage, type ChatThread } from "@/data/mockTrainer";
import { readJson, writeJson } from "@/lib/api/storage";

const THREADS_KEY = "kwoka_member_chat_threads";
const MESSAGES_KEY = "kwoka_member_chat_messages";

const COACH_THREAD_ID = "member-coach";

function defaultThread(memberName: string): ChatThread {
  return {
    id: COACH_THREAD_ID,
    clientId: "me",
    clientName: memberName || "You",
    lastPreview: "Ask your coach anything about training or recovery.",
    updatedAt: new Date().toISOString(),
    unread: 1,
  };
}

function defaultMessages(): ChatMessage[] {
  return [
    {
      id: "mm-1",
      threadId: COACH_THREAD_ID,
      from: "coach",
      body: "Welcome! Message me anytime about form, schedule changes, or how sessions feel.",
      at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "mm-2",
      threadId: COACH_THREAD_ID,
      from: "coach",
      body: mockChatMessages.find((m) => m.from === "coach")?.body ??
        "Drop intensity ~20% on recovery weeks and prioritize sleep.",
      at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];
}

function readThreads(memberName: string): ChatThread[] {
  const stored = readJson<ChatThread[] | null>(THREADS_KEY, null);
  if (stored && stored.length > 0) return stored;
  const seeded = [defaultThread(memberName)];
  writeJson(THREADS_KEY, seeded);
  return seeded;
}

function readMessages(): ChatMessage[] {
  const stored = readJson<ChatMessage[] | null>(MESSAGES_KEY, null);
  if (stored && stored.length > 0) return stored;
  const seeded = defaultMessages();
  writeJson(MESSAGES_KEY, seeded);
  return seeded;
}

export const memberChatApi = {
  listThreads(memberName: string): ChatThread[] {
    return readThreads(memberName).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  getCoachThread(memberName: string): ChatThread {
    return this.listThreads(memberName)[0] ?? defaultThread(memberName);
  },

  listMessages(threadId: string): ChatMessage[] {
    return readMessages()
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  },

  markRead(threadId: string, memberName: string) {
    const threads = readThreads(memberName).map((t) =>
      t.id === threadId ? { ...t, unread: 0 } : t,
    );
    writeJson(THREADS_KEY, threads);
  },

  sendFromClient(threadId: string, body: string, memberName: string): ChatMessage {
    const msg: ChatMessage = {
      id: `mm-${Date.now()}`,
      threadId,
      from: "client",
      body: body.trim(),
      at: new Date().toISOString(),
    };
    writeJson(MESSAGES_KEY, [...readMessages(), msg]);
    const threads = readThreads(memberName).map((t) =>
      t.id === threadId
        ? { ...t, lastPreview: msg.body, updatedAt: msg.at, unread: 0 }
        : t,
    );
    writeJson(THREADS_KEY, threads);
    return msg;
  },

  /** Seed helper — unused by UI but keeps mock parity with trainer chat data. */
  demoPreviewFromMocks() {
    return mockChatThreads[0];
  },
};
