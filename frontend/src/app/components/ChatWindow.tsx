"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Copy, Check, AlertTriangle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatLogic, Message } from "@/hooks/useChatLogic";
import { Settings } from "lucide-react";
import Link from "next/link";
// ============================================================================
// SMALL, REUSABLE UI COMPONENTS
// ============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Copy message">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-24 select-none">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
        <Sparkles size={24} className="text-indigo-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">System MCP Agent</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        Ask anything to trigger local MCP tools. Use <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded">Shift+Enter</kbd> for a new line.
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <Loader2 size={14} className="text-indigo-600 animate-spin" />
      </div>
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  // ✨ REMOVED: const isKeyError = msg.isError && msg.content.includes("Account Settings");

  return (
    <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {msg.role === "agent" && (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.isError ? "bg-red-50" : "bg-indigo-50"}`}>
          {msg.isError ? <AlertTriangle size={14} className="text-red-500" /> : <Bot size={14} className="text-indigo-600" />}
        </div>
      )}
      
      {/* Bubble Content */}
      <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
        {msg.role === "user" ? (
          <div className="group relative">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <div className="absolute -left-7 top-1/2 -translate-y-1/2">
              <CopyButton text={msg.content} />
            </div>
          </div>
        ) : (
          <div className={`group relative ${msg.isError ? "bg-red-50 border border-red-100 rounded-2xl rounded-tl-sm px-4 py-3" : ""}`}>
            
            {/* ✨ UPDATED: Standard Error UI without the Account Settings link */}
            {msg.isError ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-sm text-red-700 leading-relaxed">{msg.content}</p>
              </div>
            ) : (
              // Normal markdown message
              <div className="prose prose-sm prose-gray max-w-none prose-p:leading-relaxed prose-p:my-1 prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}

            {!msg.isError && (
              <div className="absolute -right-7 top-0">
                <CopyButton text={msg.content} />
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        {msg.timestamp && (
          <span className="text-[11px] text-gray-400 mt-1 select-none">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}

function ChatInput({ input, setInput, isLoading, handleSubmit }: any) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Focus textarea when loading finishes
  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 p-4 bg-white shrink-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the MCP Agent..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none py-1.5 max-h-40 leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors mb-0.5"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT (Notice how easy this is to read now!)
// ============================================================================

export default function ChatWindow() {
  const { messages, input, setInput, isLoading, messagesEndRef, handleSubmit } = useChatLogic();
  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center gap-2.5 h-14 px-5 border-b border-gray-100 shrink-0 bg-white">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Bot size={15} className="text-indigo-600" />
        </div>
        <span className="font-semibold text-gray-900 text-sm">System MCP Agent</span>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput 
        input={input} 
        setInput={setInput} 
        isLoading={isLoading} 
        handleSubmit={handleSubmit} 
      />
    </div>
  );
}