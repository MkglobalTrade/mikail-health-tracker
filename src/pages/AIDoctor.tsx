import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";
import { Send, Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AIDoctor() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatHistoryQuery = trpc.chat.history.useQuery();
  const sendMessageMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.response },
      ]);
      setMessage("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Load chat history on mount
  useEffect(() => {
    if (chatHistoryQuery.data) {
      const formattedMessages = chatHistoryQuery.data
        .reverse()
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      setMessages(formattedMessages);
    }
  }, [chatHistoryQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({ message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">AI Doctor</h1>

        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              Health Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your health, get guidance, and discuss your lab results
            </CardDescription>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">Welcome to AI Doctor</p>
                  <p className="text-sm text-slate-400">
                    Ask me questions about your health, medications, or lab results
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <Bot className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-200 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your health..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              This AI assistant provides general health information. Always consult with your healthcare provider for medical advice.
            </p>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold">Ask Questions:</span> You can ask about your health conditions, medications, symptoms, and general wellness topics.
            </p>
            <p>
              <span className="font-semibold">Share Data:</span> The AI has access to your recent glucose readings, blood pressure measurements, and medications to provide personalized guidance.
            </p>
            <p>
              <span className="font-semibold">Lab Results:</span> Upload lab documents and ask the AI to help interpret your results.
            </p>
            <p className="text-xs text-slate-500 italic">
              ⚠️ Disclaimer: This AI assistant is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for diagnosis and treatment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
