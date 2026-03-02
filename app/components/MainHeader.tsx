"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { NotificationsPanel } from "./chat/NotificationsPanel";

export function MainHeader() {
    const pendingInvites = useQuery((api as any).messages.getPendingInvites, {});
    const inviteCount = pendingInvites?.length || 0;
    const unreadNotifications = useQuery(api.notifications.getUnreadCount, {}) || 0;
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

    return (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 px-5 py-3 shrink-0 z-50">
            <div className="flex items-center gap-6 justify-self-start min-w-0">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-600 text-white text-sm">
                        💬
                    </span>
                    Tars Connect
                </Link>
            </div>

            <nav className="hidden sm:flex items-center justify-center gap-6 justify-self-center">
                <Link href="/chat" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Chat
                </Link>
                <Link href="/privacy-policy" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Privacy Policy
                </Link>
                <Link href="/code-of-conduct" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Code of Conduct
                </Link>
            </nav>

            <div className="flex items-center gap-3 justify-self-end">
                <Authenticated>
                    {/* Notifications Button */}
                    <button
                        onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
                        className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </span>
                        )}
                    </button>
                    
                    <UserButton afterSignOutUrl="/" />
                </Authenticated>
                <Unauthenticated>
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-indigo-600 dark:bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-all active:scale-95">
                            Sign In
                        </button>
                    </SignInButton>
                </Unauthenticated>
            </div>
            
            {/* Notifications Panel */}
            <NotificationsPanel 
                isOpen={isNotificationsPanelOpen} 
                onClose={() => setIsNotificationsPanelOpen(false)}
            />
        </header>
    );
}
