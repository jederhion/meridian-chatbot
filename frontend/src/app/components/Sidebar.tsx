"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { MessageSquare, Settings, Bot, Clock } from "lucide-react";
import { useChat } from "@/lib/ChatContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); 
  const { chatSessionId, setChatSessionId, startNewChat, chatHistory } = useChat();

  return (
    <aside className="w-64 flex flex-col h-screen shrink-0 bg-[#111318] text-[#a1a8b8] border-r border-white/[0.06]">

      {/* ── LOGO / BRAND ── */}
      <div className="flex items-center gap-2.5 px-5 h-[60px] border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">MCP Agent</span>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 tracking-wide">
          MVP
        </span>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-6">

        {/* NEW CHAT */}
        <div className="px-3">
          <button
            onClick={startNewChat}
            className="w-full group flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 shadow-lg shadow-indigo-900/30"
          >
            <MessageSquare size={16} className="shrink-0" />
            <span>New Chat</span>
          </button>
        </div>

        {/* ── RECENT CHATS ── */}
        {chatHistory.length > 0 && (
          <section>
            <SectionLabel>Recent</SectionLabel>
            <ul className="mt-1 space-y-0.5 px-2">
              {chatHistory.map((session) => {
                const isActive = chatSessionId === session.id;
                return (
                  <li key={session.id}>
                    <button
                      onClick={() => {
                        setChatSessionId(session.id);
                        if (pathname !== "/") {
                          router.push("/");
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left group ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-[#a1a8b8] hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <Clock
                        size={16}
                        className={`shrink-0 ${isActive ? "text-indigo-400" : "text-[#555e72] group-hover:text-[#a1a8b8]"}`}
                      />
                      <span className="text-sm font-medium truncate">{session.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </nav>

      {/* ── FOOTER / SETTINGS ── */}
      <div className="shrink-0 px-2 py-3 border-t border-white/[0.06]">
        <Link
          href="/account"
          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 ${
            pathname === "/account"
              ? "bg-white/[0.08] text-white"
              : "text-[#a1a8b8] hover:bg-white/[0.05] hover:text-white"
          }`}
        >
          <Settings size={16} className={`shrink-0 ${pathname === "/account" ? "text-indigo-400" : "text-[#555e72] group-hover:text-[#a1a8b8]"}`} />
          <span className="text-sm font-medium">Account</span>
        </Link>
      </div>
    </aside>
  );
}

/* ── Small helper components ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 mb-1 text-[10.5px] font-semibold text-[#555e72] uppercase tracking-widest">
      {children}
    </div>
  );
}