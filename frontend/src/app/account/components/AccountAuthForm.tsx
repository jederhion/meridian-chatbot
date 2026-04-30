"use client";

import { useState } from "react";
import { User, CheckCircle2, XCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

type SettingsAuthFormProps = {
  onSuccess: () => void;
};

export default function SettingsAuthForm({ onSuccess }: SettingsAuthFormProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState<"error" | "success">("error");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");

    if (!isLoginView && password !== confirmPassword) {
      setAuthMessage("Passwords do not match.");
      setAuthMessageType("error");
      return;
    }

    if (!isLoginView && password.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      setAuthMessageType("error");
      return;
    }
    
    const endpoint = isLoginView ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const response = await fetchApi(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginView) {
          localStorage.setItem("username", username);
          onSuccess(); // Tell the parent page that login was successful
        } else {
          setAuthMessage("Account created! You can now sign in.");
          setAuthMessageType("success");
          setIsLoginView(true);
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        setAuthMessage(data.detail || "Authentication failed.");
        setAuthMessageType("error");
      }
    } catch (error) {
      setAuthMessage("Error connecting to server.");
      setAuthMessageType("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6 border border-gray-200">
          <button
            type="button"
            onClick={() => { setIsLoginView(true); setAuthMessage(""); setConfirmPassword(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isLoginView ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginView(false); setAuthMessage(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !isLoginView ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <User size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoginView ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isLoginView ? "Sign in to manage your API keys and bots." : "Register to securely store your keys across devices."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                placeholder="your_username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete={isLoginView ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLoginView && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/10"
                  }`}
                  placeholder="••••••••"
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} /> Passwords don't match
                  </p>
                )}
              </div>
            )}

            {authMessage && (
              <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                authMessageType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {authMessageType === "success" ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <XCircle size={15} className="shrink-0 mt-0.5" />}
                {authMessage}
              </div>
            )}

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm mt-1">
              {isLoginView ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="px-6 pb-5 text-center">
            <p className="text-sm text-gray-500">
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLoginView(!isLoginView); setAuthMessage(""); setConfirmPassword(""); }}
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {isLoginView ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}