import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ChatProvider } from "@/lib/ChatContext";
import Sidebar from "@/app/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MCP Agent",
  description: "An Andela Bootcamp MCP Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            {/* Restored: The main flex container forcing the app to take the full screen height */}
            <div className="flex h-screen w-full overflow-hidden bg-[#0b0d13]">
              
              {/* Restored: Your Sidebar component */}
              <Sidebar />
              
              {/* Restored: The main content wrapper that allows the chat window to fill the rest of the space */}
              <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                {children}
              </main>

            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}