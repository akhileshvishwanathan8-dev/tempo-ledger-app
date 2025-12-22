import { useState } from "react";
import { Sparkles, Send, Mic, TrendingUp, Calendar, HelpCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const suggestedQueries = [
  { icon: TrendingUp, text: "How much did we earn last month?" },
  { icon: Calendar, text: "What's our next gig?" },
  { icon: HelpCircle, text: "Who hasn't confirmed availability?" },
];

const sampleConversation = [
  {
    role: "assistant",
    content: "Hey! I'm Musifi, your band's AI assistant. I can help you with finances, gigs, availability, and more. What would you like to know?",
  },
];

export default function AI() {
  const [messages, setMessages] = useState(sampleConversation);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([
      ...messages,
      { role: "user", content: input },
      { 
        role: "assistant", 
        content: "I understand you're asking about \"" + input + "\". To provide accurate information, I'll need to be connected to your band's data. This feature will be available once the backend is set up!" 
      },
    ]);
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <header className="px-4 py-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow-purple">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/50 animate-pulse-ring" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Musifi AI</h1>
              <p className="text-sm text-muted-foreground">Your band's intelligent assistant</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex opacity-0 animate-slide-up",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="space-y-2 opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Try asking</p>
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(query.text)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <query.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {query.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Mic className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Musifi anything..."
                className="w-full h-12 px-4 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
