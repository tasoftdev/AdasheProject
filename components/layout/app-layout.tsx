"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { useEffect, useState } from "react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full relative overflow-hidden">
     
        {mounted && (
          <div className="fixed inset-0 -z-10 overflow-hidden">
          
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
            
            <div 
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `
                  linear-gradient(#3B82F6 1px, transparent 1px),
                  linear-gradient(90deg, #3B82F6 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />

            <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
            <div className="absolute top-40 right-40 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-60 animation-delay-1000"></div>
            <div className="absolute bottom-20 left-40 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-float opacity-60 animation-delay-2000"></div>
            <div className="absolute bottom-40 right-20 w-1 h-1 bg-green-400 rounded-full animate-float opacity-60 animation-delay-3000"></div>
          </div>
        )}

        <div className="relative z-20">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
     
          <div className="relative z-30">
            <AppHeader />
          </div>
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 relative">
       
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-indigo-100/40 backdrop-blur-sm"></div>
             <div className="relative z-10 max-w-7xl mx-auto h-full">
          <div className="min-h-full rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
             
                <div className="p-4 sm:p-6 lg:p-8 h-full">
                  {children}
                </div>
              </div>
            </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-3xl"></div>
          </main>
        </div>

      
        <style jsx global>{`
          @keyframes pulse-slow {
            0%, 100% { 
              transform: scale(1) rotate(0deg); 
              opacity: 0.2; 
            }
            50% { 
              transform: scale(1.05) rotate(180deg); 
              opacity: 0.15; 
            }
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            50% { 
              transform: translateY(-10px) rotate(180deg); 
            }
          }
          
          @keyframes shimmer {
            0% { 
              background-position: -1000px 0; 
            }
            100% { 
              background-position: 1000px 0; 
            }
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 15s ease-in-out infinite;
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(
              to right,
              transparent 0%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 100%
            );
            background-size: 1000px 100%;
          }
          
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-3000 {
            animation-delay: 3s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }

          /* Custom scrollbar for main content */
          main::-webkit-scrollbar {
            width: 8px;
          }
          
          main::-webkit-scrollbar-track {
            background: rgba(59, 130, 246, 0.1);
            border-radius: 4px;
          }
          
          main::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
            border-radius: 4px;
          }
          
          main::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563EB, #7C3AED);
          }

          /* Smooth transitions for layout changes */
          .sidebar-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Enhanced focus styles */
          .focus-ring:focus-visible {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
            border-radius: 8px;
          }

          /* Loading animation for content */
          @keyframes content-fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .content-fade-in {
            animation: content-fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </SidebarProvider>
  )
}