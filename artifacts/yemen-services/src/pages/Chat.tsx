import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { chatIdFor, ensureChat, sendMessage, watchChat, watchChatMessages, watchTechnician } from "@/lib/services";
import { useSession } from "@/contexts/SessionContext";
import type { Chat as ChatType, ChatMessage, Technician } from "@/lib/types";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { deviceId } = useSession();
  const [tech, setTech] = useState<Technician | null>(null);
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatId = id ? chatIdFor(id, deviceId) : "";

  useEffect(() => {
    if (!id) return;
    const u1 = watchTechnician(id, setTech);
    return () => u1();
  }, [id]);

  useEffect(() => {
    if (!id || !tech) return;
    ensureChat(chatId, id, tech.name, deviceId);
  }, [id, tech, chatId, deviceId]);

  useEffect(() => {
    if (!chatId) return;
    const u1 = watchChat(chatId, setChat);
    const u2 = watchChatMessages(chatId, setMessages);
    return () => {
      u1();
      u2();
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || chat?.blocked) return;
    setSending(true);
    try {
      await sendMessage(chatId, "user", text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title={tech ? `محادثة مع ${tech.name}` : "محادثة"} back>
      <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground ms-auto rounded-es-sm"
                  : "bg-card border me-auto rounded-ee-sm"
              }`}
            >
              {m.text}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-10">
              ابدأ المحادثة مع {tech?.name ?? "الفني"}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {chat?.blocked ? (
          <div className="p-4 text-center text-sm text-destructive border-t bg-card">
            تم إيقاف هذه المحادثة من قبل الإدارة
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 border-t bg-card flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 border rounded-full px-4 py-2.5 text-sm bg-background"
              data-testid="input-chat-message"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50"
              data-testid="button-send-message"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
