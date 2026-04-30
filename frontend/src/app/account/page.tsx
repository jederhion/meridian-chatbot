"use client";

import { Settings, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

import SettingsAuthForm from "./components/AccountAuthForm";
import AccountDashboard from "./components/AccountDashboard"; 
// ✨ Removed AccountKeyManager import

export default function SettingsPage() {
  const { isLoggedIn, isLoadingAuth, checkAuth, logout } = useAuth();
  
  // ✨ Removed isKeyActive and isLoadingKey states and their useEffect

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-indigo-600" />
          <h1 className="font-semibold text-gray-800">Account</h1>
        </div>
        {isLoggedIn && (
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full pb-24 space-y-8">
        {!isLoggedIn ? (
          <SettingsAuthForm onSuccess={checkAuth} />
        ) : (
          <>
            <AccountDashboard />
            {/* ✨ Removed SettingsKeyManager component */}
          </>
        )}
      </div>
    </div>
  );
}