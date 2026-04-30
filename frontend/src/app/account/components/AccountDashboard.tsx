"use client";

import { useState, useEffect } from "react";
import { Activity, MessageSquare, Database, Zap } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface UserMetrics {
  tokensUsedThisMonth: number;
  totalChats: number;
  storageUsedMB: number;
  activeBots: number;
}

export default function AccountDashboard() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // ✨ Now fetching real data from your FastAPI backend!
        const response = await fetchApi("/api/settings/metrics", {
          credentials: "include", // Ensures the session cookie is sent
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
        setError("Could not load usage dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <Activity size={18} className="text-indigo-600" />
        <h2 className="font-semibold text-gray-800">Usage Dashboard</h2>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100 flex flex-col items-center text-center">
          <Zap size={24} className="text-indigo-600 mb-2" />
          <span className="text-2xl font-bold text-gray-800">
            {metrics?.tokensUsedThisMonth.toLocaleString() || 0}
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Tokens This Month</span>
        </div>

        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex flex-col items-center text-center">
          <MessageSquare size={24} className="text-blue-600 mb-2" />
          <span className="text-2xl font-bold text-gray-800">
            {metrics?.totalChats.toLocaleString() || 0}
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Chats</span>
        </div>

        <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100 flex flex-col items-center text-center">
          <Database size={24} className="text-emerald-600 mb-2" />
          <span className="text-2xl font-bold text-gray-800">
            {metrics?.storageUsedMB.toFixed(1) || "0.0"} <span className="text-sm font-medium">MB</span>
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Storage Used</span>
        </div>

        <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100 flex flex-col items-center text-center">
          <Activity size={24} className="text-purple-600 mb-2" />
          <span className="text-2xl font-bold text-gray-800">
            {metrics?.activeBots.toLocaleString() || 0}
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Active Personas</span>
        </div>
      </div>
    </div>
  );
}