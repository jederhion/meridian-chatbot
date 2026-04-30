"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@/lib/ChatContext";
import { fetchApi } from "@/lib/api";

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp?: Date;
  isError?: boolean;
};

export function useChatLogic() {
  const { chatSessionId, refreshThreads } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Fetch history when the active thread changes
  useEffect(() => {
    if (!chatSessionId) return;

    const fetchHistory = async () => {
      setMessages([]);
      setInput("");
      setIsLoading(false);

      try {
        const res = await fetchApi(`/api/chat/${chatSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.history?.length > 0) {
            setMessages(
              data.history.map((m: any) => ({
                ...m,
                timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
              }))
            );
          }
        }
      } catch {
        // Silent fail for history
      }
    };

    fetchHistory();
  }, [chatSessionId]);

  // Handle sending a new message
  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetchApi("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: trimmed,
          thread_id: chatSessionId,
        }),
      });

      if (!response.ok) {
        let detail = `Server error (${response.status})`;
        try {
          const err = await response.json();
          detail = err.detail || err.error || detail;
        } catch {}
        throw new Error(detail);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-agent`,
          role: "agent",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      await refreshThreads();
    } catch (error: any) {
      const isNetwork = error.message.includes("Failed to fetch");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "agent",
          content: isNetwork ? "Unable to reach the server. Please check your connection." : error.message,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, chatSessionId, refreshThreads]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit,
  };
}