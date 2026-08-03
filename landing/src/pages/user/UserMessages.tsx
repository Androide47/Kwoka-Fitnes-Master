import { useMemo, useState } from "react";
import { format } from "date-fns";
import { getMemberSession } from "@/lib/auth";
import { memberChatApi } from "@/lib/api/memberChatApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UserMessages = () => {
  const session = getMemberSession();
  const memberName = session?.user.name ?? "You";
  const [version, setVersion] = useState(0);
  const [draft, setDraft] = useState("");

  const thread = useMemo(() => {
    void version;
    const t = memberChatApi.getCoachThread(memberName);
    memberChatApi.markRead(t.id, memberName);
    return t;
  }, [memberName, version]);

  const messages = useMemo(() => {
    void version;
    return memberChatApi.listMessages(thread.id);
  }, [thread.id, version]);

  const send = () => {
    if (!draft.trim()) return;
    memberChatApi.sendFromClient(thread.id, draft, memberName);
    setDraft("");
    setVersion((n) => n + 1);
    toast.success("Message sent (demo).");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <h1 className="font-display text-3xl">Messages</h1>
        <p className="text-muted-foreground">Chat with your coach.</p>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col bg-card/80">
        <CardHeader className="shrink-0 border-b border-border">
          <CardTitle className="font-display text-base">Coach</CardTitle>
          <CardDescription>{thread.lastPreview}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.from === "client"
                      ? "ml-auto bg-secondary/25 text-white"
                      : "mr-auto bg-muted text-foreground",
                  )}
                >
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {format(new Date(m.at), "MMM d · h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex shrink-0 gap-2">
            <Textarea
              rows={2}
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button
              className="self-end bg-secondary text-white hover:bg-secondary/90"
              onClick={send}
              disabled={!draft.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMessages;
