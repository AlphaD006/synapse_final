import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const SYSTEM_CONTEXT = `You are Synapse, an AI study planner assistant for Aryan, a Grade 12 Indian student preparing for JEE Advanced, JEE Mains, CBSE Boards, and CUET. His exams are in Feb-May 2025. He studies 8 hours daily. You help restructure his study plan based on natural language inputs. Keep responses under 4 lines. Be direct, friendly, and action-oriented.`;

export function ChatBox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey Aryan 👋 I'm Synapse. Tell me about anything that changes — a holiday, a sick day, a new exam date — and I'll restructure your plan instantly.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      const contents = updatedMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const body = {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_CONTEXT }],
        },
        generationConfig: {
          maxOutputTokens: 200,
        },
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${JSON.stringify(data)}`);
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply || typeof reply !== "string") {
        throw new Error(`Malformed Gemini response: ${JSON.stringify(data)}`);
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't connect. Try again." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_10px_40px_-5px_rgba(255,45,126,0.6)] transition hover:scale-110"
          style={{ background: "linear-gradient(135deg, #ff2d7e, #6c63ff)" }}
          aria-label="Open Synapse AI chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 flex flex-col overflow-hidden rounded-3xl"
          style={{
            width: "380px",
            height: "520px",
            maxWidth: "calc(100vw - 24px)",
            background: "rgba(15, 15, 25, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,126,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #ff2d7e, #6c63ff)" }}
              >
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Synapse AI</div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[10px] text-emerald-400">online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            style={{ scrollbarWidth: "none" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? {
                        background: "linear-gradient(135deg, #ff2d7e, #6c63ff)",
                        color: "white",
                        borderRadius: "18px 18px 4px 18px",
                      }
                      : {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "18px 18px 18px 4px",
                      }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-2xl px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "18px 18px 18px 4px",
                  }}
                >
                  {[0, 120, 240].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "#ff2d7e",
                        animation: "bounce 0.9s infinite",
                        animationDelay: `${delay}ms`,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="p-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Tell Synapse anything…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ff2d7e")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                disabled={typing}
              />
              <button
                onClick={send}
                disabled={typing || !input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #ff2d7e, #6c63ff)" }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
