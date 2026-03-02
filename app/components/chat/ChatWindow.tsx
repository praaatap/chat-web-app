"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AISuggestionsModal } from "./AISuggestionsModal";
import { formatMessageTimestamp } from "../../lib/utils";
import { useToneStore } from '@/app/store/useTone';
import { useChatStore } from '@/app/store/useChatStore';


interface ChatWindowProps {
    messages: any[];
    onSendMessage: (message: string, replyTo?: string, replyToUser?: string, file?: File, mediaType?: 'image' | 'video') => void;
    onBack: () => void;
    selectedConversation?: any;
    currentUserId?: string;
    isSending?: boolean;
    error?: string | null;
    isGroupChat?: boolean;
    groupMembers?: any[];
    onAddMembers?: () => void;
    onDelete?: () => void;
}

export function ChatWindow({
    messages,
    onSendMessage,
    onBack,
    selectedConversation,
    currentUserId,
    isSending,
    error,
    isGroupChat,
    groupMembers,
    onAddMembers,
    onDelete,
}: ChatWindowProps) {
    const { user } = useUser();
    const userName = user?.firstName || "the user";
    const [input, setInput] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: string, body: string, user: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tone = useToneStore(state => state.tone);
    const setTone = useToneStore(state => state.setTone);
    
    // File upload state from ChatStore
    const { selectedFile, setSelectedFile, filePreview, setFilePreview, clearFileSelection } = useChatStore();

    const setTyping = useMutation((api as any).messages.setTyping);
    const clearTyping = useMutation((api as any).messages.clearTyping);
    const deleteMessage = useMutation((api as any).messages.deleteMessage);
    const toggleReaction = useMutation((api as any).messages.toggleReaction);

    const handleTyping = () => {
        if (!selectedConversation?._id) return;
        setTyping({ conversationId: selectedConversation._id });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Check if it's an image or video
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            alert('Please select an image or video file');
            return;
        }
        
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }
        
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || isSending) return;
        const currentInput = input;
        const currentReplyTo = replyTo;
        const currentFile = selectedFile;
        const mediaType = currentFile?.type.startsWith('image/') ? 'image' : 'video';

        setInput("");
        setReplyTo(null);
        clearFileSelection();

        if (selectedConversation?._id) {
            clearTyping({ conversationId: selectedConversation._id });
        }

        try {
            await onSendMessage(currentInput, currentReplyTo?.body, currentReplyTo?.user, currentFile || undefined, mediaType);
        } catch (err) {
            console.error("Failed to send:", err);
        }

        // Force scroll to bottom after sending
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleGetAiSuggestions = async () => {
        if (messages.length === 0 && !replyTo) {
            setAiSuggestions([]);
            setIsAiModalOpen(true);
            return;
        }

        setIsAiLoading(true);
        setIsAiModalOpen(true);
        try {
            let context = messages.slice(-5).map(m => {
                const sender = m.sender?.name || "User";
                const body = m.body || "";
                return `${sender}: ${body}`;
            }).join("\n");

            if (replyTo) {
                context = `REPLYING TO [${replyTo.user}: ${replyTo.body}]\n\nRecent History:\n${context}`;
            }

            const res = await fetch("/api/ai/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    userName: "the user",
                    tone: tone || "Friendly",
                })
            });

            if (!res.ok) {
                setAiSuggestions([]);
                setIsAiLoading(false);
                return;
            }

            const data = await res.json();
            if (Array.isArray(data.suggestions)) {
                setAiSuggestions(data.suggestions);
            } else {
                setAiSuggestions([]);
            }
        } catch (err) {
            console.error("AI fetch failed:", err);
            setAiSuggestions([]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsAtBottom(atBottom);
        if (atBottom) setShowScrollButton(false);
    };

    useEffect(() => {
        if (isAtBottom && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        } else if (messages.length > 0) {
            setShowScrollButton(true);
        }
    }, [messages, isAtBottom]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
            setShowScrollButton(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1 -ml-1 text-zinc-600 hover:text-zinc-900 lg:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="relative">
                        {selectedConversation?.imageUrl ? (
                            <img src={selectedConversation.imageUrl} alt={selectedConversation.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                {selectedConversation?.name?.[0] || 'C'}
                            </div>
                        )}
                        {selectedConversation?.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500" />
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50 block leading-tight">{selectedConversation?.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isGroupChat
                                ? `${groupMembers?.length || 0} members`
                                : selectedConversation?.isOnline ? 'Online' : 'Offline'
                            }
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onDelete && (
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this conversation? This will hide it from your list.")) {
                                    onDelete();
                                }
                            }}
                            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                    {isGroupChat && onAddMembers && (
                        <button
                            onClick={onAddMembers}
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-zinc-900/40 p-4 lg:p-6 space-y-2 relative"
            >
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg text-xs shadow-md z-30 flex items-center gap-2 max-w-[90%] w-max">
                        <span>{error}</span>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <div className="h-16 w-16 bg-white/50 dark:bg-zinc-800/50 backdrop-blur rounded-full flex items-center justify-center text-2xl shadow-sm">
                            👋
                        </div>
                        <div className="max-w-xs">
                            <p className="text-zinc-900 dark:text-zinc-50 font-medium">No messages yet</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Start the conversation by sending a message below!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg: any) => {
                            const isMine = msg.sender?._id === currentUserId;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 group relative`}
                                >
                                    {!isMine && (
                                        <div className="mr-2 mt-auto shrink-0">
                                            {msg.sender?.imageUrl ? (
                                                <img src={msg.sender.imageUrl} alt={msg.sender.name} className="h-7 w-7 rounded-full object-cover shadow-sm" />
                                            ) : (
                                                <div className="h-7 w-7 rounded-full bg-indigo-200" />
                                            )}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] lg:max-w-[70%]`}>
                                        <div
                                            className={`rounded-2xl px-3 py-1.5 shadow-sm relative transition-all ${isMine
                                                ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none'
                                                }`}
                                        >
                                            {!isMine && msg.sender?.name && (
                                                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">{msg.sender.name}</p>
                                            )}

                                            {msg.replyTo && (
                                                <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${isMine ? 'bg-white/10 border-white/30 text-white/90' : 'bg-zinc-100 dark:bg-zinc-700 border-indigo-200 dark:border-indigo-600 text-zinc-600 dark:text-zinc-300'} italic`}>
                                                    <p className="font-bold not-italic mb-0.5 text-[10px] uppercase opacity-70">
                                                        {msg.replyToUser || 'User'} said:
                                                    </p>
                                                    <p className="line-clamp-2">{msg.replyTo}</p>
                                                </div>
                                            )}

                                            {msg.mediaUrl && msg.mediaType === 'image' && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    <img 
                                                        src={msg.mediaUrl} 
                                                        alt="Shared image" 
                                                        className="max-w-full max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                                                    />
                                                </div>
                                            )}

                                            {msg.mediaUrl && msg.mediaType === 'video' && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    <video 
                                                        src={msg.mediaUrl} 
                                                        controls 
                                                        className="max-w-full max-h-80 object-contain"
                                                    />
                                                </div>
                                            )}

                                            <p className={`text-[14px] leading-relaxed whitespace-pre-wrap break-all ${msg.deleted ? 'italic text-opacity-70' : ''}`}>
                                                {msg.body}
                                            </p>

                                            <div className={`text-[10px] mt-1 flex justify-end gap-2 items-center ${isMine ? 'text-white/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                                {formatMessageTimestamp(msg.createdAt)}
                                                {isMine && !msg.deleted && (
                                                    <button
                                                        onClick={() => deleteMessage({ messageId: msg._id })}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {!msg.deleted && (
                                                <div className={`absolute top-0 ${isMine ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 flex gap-1 bg-white dark:bg-zinc-800 shadow-lg rounded-full px-2 py-1 border border-zinc-100 dark:border-zinc-700 z-20 transition-all scale-90 group-hover:scale-100`}>
                                                    <button
                                                        onClick={() => setReplyTo({ id: msg._id, body: msg.body, user: msg.sender?.name || "User" })}
                                                        className="hover:scale-125 transition-transform p-1 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                    </button>
                                                    {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                            className={`hover:scale-125 transition-transform p-0.5 ${msg.reactions?.[currentUserId || ''] === emoji ? 'bg-indigo-50 dark:bg-indigo-900 rounded-full' : ''}`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className={`flex gap-1 -mt-1.5 z-10 ${isMine ? 'mr-2' : 'ml-2'}`}>
                                                {msg.reactions.map(({ emoji, count }: { emoji: string, count: number }) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                        className={`flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-full px-1.5 py-0.5 border border-zinc-100 dark:border-zinc-700 shadow-sm text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors ${msg.userReaction === emoji ? 'border-indigo-200 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900' : ''}`}
                                                    >
                                                        <span>{emoji}</span>
                                                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {selectedConversation?.isTyping && (
                            <div className="flex gap-2 items-center text-zinc-500 dark:text-zinc-400 text-[11px] animate-pulse ml-9">
                                <div className="flex gap-1">
                                    <span className="h-1 w-1 bg-zinc-400 dark:bg-zinc-600 rounded-full"></span>
                                    <span className="h-1 w-1 bg-zinc-400 dark:bg-zinc-600 rounded-full"></span>
                                    <span className="h-1 w-1 bg-zinc-400 dark:bg-zinc-600 rounded-full"></span>
                                </div>
                                <span>typing...</span>
                            </div>
                        )}
                    </>
                )}

                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 flex items-center gap-2 z-10"
                    >
                        ↓ New messages
                    </button>
                )}
            </div>

            {replyTo && (
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1 bg-indigo-500 h-8 rounded-full shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Replying to {replyTo.user}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">{replyTo.body}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {filePreview && selectedFile && (
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="relative">
                            {selectedFile.type.startsWith('image/') ? (
                                <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center">
                                    <span className="text-2xl">🎥</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={clearFileSelection}
                            className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
                        title="Attach image or video"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <button
                        onClick={handleGetAiSuggestions}
                        className="p-1.5 text-indigo-400 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all cursor-pointer group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
                    </button>
                    <select
                        className="bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors cursor-pointer"
                        onChange={(e) => {
                            setTone(e.target.value);
                        }}
                    >
                        <option value="Friendly">Friendly</option>
                        <option value="Professional">Professional</option>
                        <option value="Funny">Funny</option>
                        <option value="Sarcastic">Sarcastic</option>
                    </select>
                    <input
                        className="flex-1 bg-transparent text-[14px] text-zinc-700 dark:text-zinc-200 outline-none placeholder-zinc-400 dark:placeholder-zinc-500"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedFile) || isSending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
                    >
                        {isSending ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <AISuggestionsModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                isLoading={isAiLoading}
                suggestions={aiSuggestions}
                hasMessages={messages.length > 0}
                onSelect={(s) => {
                    setInput(s);
                    setIsAiModalOpen(false);
                }}
            />
        </>
    );
}
