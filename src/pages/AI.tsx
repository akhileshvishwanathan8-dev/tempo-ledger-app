import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RotateCcw, TrendingUp, Calendar, HelpCircle, Music, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/hooks/useAIChat";

const suggestedQueries = [
  { icon: TrendingUp, text: "How can I track my band's earnings?" },
  { icon: Calendar, text: "Tips for managing gig schedules" },
  { icon: HelpCircle, text: "How do I handle member payouts fairly?" },
  { icon: Music, text: "Best practices for organizing a setlist" },
];

export default function AI() {
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    setInput("");
    sendMessage(text);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Musifi AI</h1>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Thinking..." : "Your band's assistant"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              disabled={isLoading || messages.length <= 1}
              className="text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/60 border border-border/50 rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length <= 1 && !isLoading && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Try asking</p>
              <div className="grid gap-2">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(query.text)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all text-left group border border-border/30"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <query.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {query.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask Musifi anything..."
                disabled={isLoading}
                className="w-full h-12 px-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0 rounded-xl h-12 w-12"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

