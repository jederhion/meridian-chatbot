"use client";

import { useState } from "react";
import { Key, CheckCircle2, XCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

type SettingsKeyManagerProps = {
  initialKeyActive: boolean;
};

export default function SettingsKeyManager({ initialKeyActive }: SettingsKeyManagerProps) {
  const [openAIKey, setOpenAIKey] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [isKeyActive, setIsKeyActive] = useState(initialKeyActive);

  const handleSaveKeys = async () => {
    if (!openAIKey.trim()) {
      setKeyMessage("Please enter a key first.");
      return;
    }
    
    setKeyMessage("Saving...");
    try {
      const response = await fetchApi("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ openai_api_key: openAIKey }),
      });

      if (response.ok) {
        setKeyMessage("Key securely saved to your profile!");
        setOpenAIKey(""); 
        setIsKeyActive(true);
        setTimeout(() => setKeyMessage(""), 3000);
      } else {
        setKeyMessage("Failed to save key.");
      }
    } catch (error) {
      setKeyMessage("Error connecting to server.");
    }
  };

  const handleClearKeys = async () => {
    setKeyMessage("Clearing...");
    try {
      const response = await fetchApi("/api/settings/keys/clear", {
        method: "POST",
        credentials: "include", 
      });

      if (response.ok) {
        setKeyMessage("API Key removed from profile.");
        setOpenAIKey(""); 
        setIsKeyActive(false);
        setTimeout(() => setKeyMessage(""), 3000);
      } else {
        setKeyMessage("Failed to clear keys.");
      }
    } catch (error) {
      setKeyMessage("Error connecting to server.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-800">OpenAI Configuration</h2>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isKeyActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
        }`}>
          {isKeyActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isKeyActive ? "Key Active" : "No Key Set"}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isKeyActive ? "Update OpenAI API Key" : "Add OpenAI API Key"}
          </label>
          <input 
            type="password" 
            placeholder={isKeyActive ? "••••••••••••••••••••••••" : "sk-..."} 
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 font-mono text-sm" 
          />
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Your key is securely encrypted and tied to your user profile. You can safely access your customized bots from any device without re-entering your credentials.
          </p>
        </div>
        
        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={handleSaveKeys}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {isKeyActive ? "Update Key" : "Save Key"}
          </button>
          
          {isKeyActive && (
            <button 
              onClick={handleClearKeys}
              className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors border border-red-200 shadow-sm"
            >
              Remove Key
            </button>
          )}
        </div>
        
        {keyMessage && (
          <p className={`text-sm font-medium mt-2 ${keyMessage.includes("Error") || keyMessage.includes("Failed") || keyMessage.includes("Please") ? "text-red-600" : "text-green-600"}`}>
            {keyMessage}
          </p>
        )}
      </div>
    </div>
  );
}