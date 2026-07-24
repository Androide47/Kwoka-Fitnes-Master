import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  mockChatThreads,
  mockChatMessages,
  mockClients,
  type ChatMessage,
  type ChatThread,
} from "@/data/mockTrainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TrainerChat = () => {
  const [threads, setThreads] = useState<ChatThread[]>(mockChatThreads);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [activeThreadId, setActiveThreadId] = useState(mockChatThreads[0]?.id ?? "");
  const [reply, setReply] = useState("");

  // New Message
  const [newClientId, setNewClientId] = useState("");
  const [newBody, setNewBody] = useState("");

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId],
  );

  const threadMessages = useMemo(
    () =>
      messages
        .filter((m) => m.threadId === activeThreadId)
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    [messages, activeThreadId],
  );

  const openThread = (id: string) => {
    setActiveThreadId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const sendReply = () => {
    if (!activeThread || !reply.trim()) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      threadId: activeThread.id,
      from: "coach",
      body: reply.trim(),
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, lastPreview: msg.body, updatedAt: msg.at, unread: 0 }
          : t,
      ),
    );
    setReply("");
    toast.success("Message sent (demo).");
  };

  const startNewMessage = () => {
    const client = mockClients.find((c) => c.id === newClientId);
    if (!client || !newBody.trim()) {
      toast.error("Select a client and write a message.");
      return;
    }
    const existing = threads.find((t) => t.clientId === client.id);
    const threadId = existing?.id ?? `t-${Date.now()}`;
    const at = new Date().toISOString();
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      threadId,
      from: "coach",
      body: newBody.trim(),
      at,
    };

    if (!existing) {
      const thread: ChatThread = {
        id: threadId,
        clientId: client.id,
        clientName: client.name,
        lastPreview: msg.body,
        updatedAt: at,
        unread: 0,
      };
      setThreads((prev) => [thread, ...prev]);
    } else {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, lastPreview: msg.body, updatedAt: at, unread: 0 } : t,
        ),
      );
    }
    setMessages((prev) => [...prev, msg]);
    setActiveThreadId(threadId);
    setNewBody("");
    setNewClientId("");
    toast.success("New message started (demo).");
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl mb-2">Chat</h1>
        <p className="text-muted-foreground">
          New Message and Chats with clients — local demo, no backend.
        </p>
      </div>

      {/* New Message */}
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">New Message</CardTitle>
          <CardDescription>Start a conversation with a client.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[220px_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={newClientId} onValueChange={setNewClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select client…" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-msg">Message</Label>
            <Textarea
              id="new-msg"
              rows={2}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Write your message…"
            />
          </div>
          <Button
            type="button"
            className="bg-secondary text-white hover:bg-secondary/90"
            onClick={startNewMessage}
          >
            Send
          </Button>
        </CardContent>
      </Card>

      {/* Chats */}
      <div>
        <h2 className="font-display text-lg tracking-wide mb-4">Chats</h2>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm text-muted-foreground">Threads</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[420px]">
                <ul className="divide-y divide-border">
                  {threads.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => openThread(t.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-colors hover:bg-muted/40",
                          activeThreadId === t.id && "bg-secondary/10",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{t.clientName}</span>
                          {t.unread > 0 && <Badge variant="secondary">{t.unread}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.lastPreview}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card/80 flex flex-col">
            <CardHeader>
              <CardTitle className="font-display text-base">
                {activeThread?.clientName ?? "Select a chat"}
              </CardTitle>
              {activeThread && (
                <CardDescription>
                  Updated {format(new Date(activeThread.updatedAt), "MMM d · h:mm a")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ScrollArea className="h-[300px] rounded-md border border-border p-3">
                <div className="space-y-3">
                  {threadMessages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        m.from === "coach"
                          ? "ml-auto bg-secondary/20 text-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <p>{m.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {format(new Date(m.at), "MMM d · h:mm a")}
                      </p>
                    </div>
                  ))}
                  {threadMessages.length === 0 && (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  disabled={!activeThread}
                />
                <Button
                  type="button"
                  className="bg-secondary text-white hover:bg-secondary/90"
                  onClick={sendReply}
                  disabled={!activeThread}
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerChat;
