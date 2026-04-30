"use client";

import Link from "next/link"; // ✨ Import Link
import ChatWindow from "./components/ChatWindow";
import { Bot, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shadow-inner">
            <Bot size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800 text-sm leading-tight">My Custom Assistant</h1>
            <p className="text-xs text-gray-500">Ready to help with your tasks</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </div>

          {isLoggedIn && (
            <div className="flex items-center pl-4 border-l border-gray-100">
              <Link 
                href="/account" 
                className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 pr-2 rounded-full transition-colors group cursor-pointer"
                title="Manage Account"
              >
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {username}
                </span>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 group-hover:border-indigo-200 transition-all">
                  <User size={16} className="text-indigo-600" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 overflow-hidden relative bg-gray-50/50">
        <ChatWindow />
      </div>
    </div>
  );
}