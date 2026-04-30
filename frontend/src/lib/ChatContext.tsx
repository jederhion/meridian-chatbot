"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "./api";

export type ChatSession = {
  id: string;
  title: string;
  bot_id?: string; 
};

type ChatContextType = {
  chatSessionId: string;
  setChatSessionId: (id: string) => void;
  startNewChat: () => void;
  chatHistory: ChatSession[];
  refreshThreads: () => Promise<void>; 
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatSessionId, setChatSessionIdState] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const refreshThreads = async () => {
    try {
      const res = await fetchApi("/api/threads");
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.threads);
      }
    } catch (error) {
      console.error("Failed to load threads:", error);
    }
  };

  const setChatSessionId = (id: string) => {
    setChatSessionIdState(id);
    localStorage.setItem("active_chat_session", id);
  };

  // Run once on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("active_chat_session");
    if (savedSession) {
      setChatSessionIdState(savedSession);
    } else {
      // OPTIMIZATION: Silently create a session ID on first visit 
      // without triggering a page reload!
      const newSession = Date.now().toString();
      setChatSessionId(newSession);
    }
    refreshThreads();
  }, []);

  const startNewChat = () => {
    const newSession = Date.now().toString();
    setChatSessionId(newSession);
    
    // OPTIMIZATION: Use Next.js soft navigation instead of hard window.location reload
    // Only navigate if we aren't already on the chat page
    if (pathname !== "/") {
      router.push("/"); 
    }
  };

  return (
    <ChatContext.Provider value={{ chatSessionId, setChatSessionId, startNewChat, chatHistory, refreshThreads }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}