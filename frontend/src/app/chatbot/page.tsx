"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatbotApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string }

const suggestions = [
  "Why is my sugar high?",
  "How can I improve my activity?",
  "Should I see a doctor?",
  "What does my HbA1c mean?",
  "Give me a meal tip",
  "What's my risk level?",
];

export default function ChatbotPage() {
  const { user, token } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi ${firstName} 👋 I'm your Care Assistant. I can see your health data and help answer questions about your reports, activity, risk level, and what steps you can take to improve your health. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      // Send conversation history (last 6 messages for context)
      const history = messages.slice(-6).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const data = await chatbotApi.send(token!, q, history);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't get a response right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Care Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-powered · reads your actual health data to give personalised answers
        </p>
      </div>

      <Card className="flex-1 flex flex-col shadow-soft overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
                  m.role === "user"
                    ? "bg-gradient-primary text-white rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 shadow-soft flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div className="border-t bg-card/60 p-3 md:p-4 space-y-3">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-primary-soft text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Text input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health…"
              disabled={loading}
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-lg bg-gradient-primary text-white grid place-items-center hover:opacity-90 disabled:opacity-50 shrink-0 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
