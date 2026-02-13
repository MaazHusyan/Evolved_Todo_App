"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, Zap, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { sendMessage, sendMessageStream, getChatHistory, clearChat } from "@/services/chatApi";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication and load chat history
  useEffect(() => {
    const initializeChat = async () => {
      const jwtToken = getToken();
      const userData = localStorage.getItem("user");

      if (!jwtToken || !userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthChecking(false);

        // Load chat history
        try {
          const history = await getChatHistory(50);
          setMessages(history);
        } catch (error) {
          console.error("Failed to load chat history:", error);
          // Continue even if history fails to load
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        router.push("/login");
      }
    };

    initializeChat();
  }, [router]);

  const handleSendMessage = async (e, retryMessage = null) => {
    e?.preventDefault();
    const messageToSend = retryMessage || inputMessage.trim();

    if (!messageToSend || isLoading) return;

    if (!retryMessage) {
      setInputMessage("");
    }

    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      if (streamingEnabled) {
        // Use streaming response
        const assistantMessageId = `streaming-${Date.now()}`;
        setStreamingMessageId(assistantMessageId);
        setIsStreaming(true);

        // Create empty assistant message for streaming
        const streamingMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
          isStreaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);

        // Send streaming message
        await sendMessageStream(
          messageToSend,
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          }
        );

        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
        setStreamingMessageId(null);

        // Update conversation ID if this is the first message
        // Note: In streaming mode, we don't get conversation_id immediately
        // This would need to be added to the stream response
      } else {
        // Use non-streaming response (original behavior)
        const response = await sendMessage(messageToSend);

        // Update conversation ID if this is the first message
        if (!conversationId && response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        // Add assistant response to messages
        const assistantMessage = {
          id: response.message_id,
          role: "assistant",
          content: response.message,
          created_at: response.created_at,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Parse error message
      let errorText = "Failed to send message. Please try again.";
      if (error.message) {
        errorText = error.message;
      } else if (error.detail) {
        errorText = error.detail;
      }

      // Add error message with retry option
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorText,
        created_at: new Date().toISOString(),
        isError: true,
        retryMessage: messageToSend,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleRetry = (retryMessage) => {
    // Remove the error message
    setMessages((prev) => prev.filter((msg) => msg.retryMessage !== retryMessage));
    // Retry sending the message
    handleSendMessage(null, retryMessage);
  };

  const handleClearChat = async () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm("Are you sure you want to clear all messages? This cannot be undone.");

    if (!confirmed) return;

    try {
      // Clear on backend first
      await clearChat();
      
      // Clear messages locally after successful backend clear
      setMessages([]);
      setConversationId(null);
    } catch (error) {
      console.error("Failed to clear chat:", error);
      alert("Failed to clear chat. Please try again.");
    }
  };

  if (isAuthChecking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4 glass dark:glass-dark p-8 rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-lg font-medium">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass dark:glass-dark rounded-2xl p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Manage your tasks with natural language
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
          <button
            onClick={() => setStreamingEnabled(!streamingEnabled)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-colors ${
              streamingEnabled
                ? "bg-green-500/20 text-green-600"
                : "bg-gray-500/20 text-gray-500"
            }`}
            title={streamingEnabled ? "Streaming enabled" : "Streaming disabled"}
          >
            <Zap className="h-3 w-3" />
            <span>{streamingEnabled ? "Fast" : "Slow"}</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
              title="Clear all messages"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 glass dark:glass-dark rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <h2 className="text-xl font-semibold">
                    Welcome to your AI Assistant!
                  </h2>
                  <p className="text-muted-foreground">
                    Try asking me to:
                  </p>
                  <div className="glass dark:glass-dark rounded-xl p-4 space-y-2 text-left">
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• "Add a task to buy groceries tomorrow"</li>
                      <li>• "Show me my tasks for today"</li>
                      <li>• "Mark the first task as complete"</li>
                      <li>• "Update my urgent tasks to high priority"</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary-600 text-white"
                          : msg.isError
                          ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                          : "glass dark:glass-dark"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.isError && msg.retryMessage && (
                        <button
                          onClick={() => handleRetry(msg.retryMessage)}
                          className="mt-2 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === "user"
                            ? "text-white/70"
                            : msg.isError
                            ? "text-red-500/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass dark:glass-dark rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {isStreaming ? (
                          <>
                            <div className="flex space-x-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Streaming...
                            </span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              Thinking...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl glass dark:glass-dark focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
