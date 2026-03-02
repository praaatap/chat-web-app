"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Authenticated, AuthLoading } from "convex/react";
import { api } from "../../convex/_generated/api";

import { MainHeader } from "../components/MainHeader";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatRightSidebar } from "../components/chat/ChatRightSidebar";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ChatSkeleton } from "../components/chat/ChatSkeleton";
import { GroupInvitesPanel } from "../components/chat/GroupInvitesPanel";
import { ChatInvitesPanel } from "../components/chat/ChatInvitesPanel";
import { GroupMembersModal } from "../components/chat/GroupMembersModal";
import { GroupCreateModal } from "../components/chat/GroupCreateModal";
import { SettingsModal } from "../components/chat/SettingsModal";

import { useUIStore } from "../store/useUIStore";
import { useChatStore } from "../store/useChatStore";
import { formatMessageTimestamp } from "../lib/utils";

export default function ChatPage() {
  return (
    <>
      <Authenticated>
        <ChatContent />
      </Authenticated>
      <AuthLoading>
        <ChatSkeleton />
      </AuthLoading>
    </>
  );
}

function ChatContent() {
  const { user } = useUser();
  
  // UI Store
  const {
    sidebarWidth,
    setSidebarWidth,
    uiScale,
    setUIScale,
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    setTheme
  } = useUIStore();
  
  // Chat Store - Central state management
  const {
    selectedConversationId,
    setSelectedConversationId,
    searchValue,
    setSearchValue,
    isSending,
    setIsSending,
    error,
    setError,
    isGroupModalOpen,
    setIsGroupModalOpen,
    isAddMembersOpen,
    setIsAddMembersOpen,
    groupName,
    setGroupName,
    selectedParticipants,
    setSelectedParticipants,
    isLargeScreen,
    isExtraLargeScreen,
    handleResize,
    clearSearch,
    resetGroupCreation
  } = useChatStore();
  
  const isResizing = useRef(false);


  // Track window resize for responsive layout updates
  useEffect(() => {
    const handleWindowResize = () => {
      handleResize(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [handleResize]);

  // Apply scaling
  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale * 16}px`;
  }, [uiScale]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 260 && newWidth <= 480) {
      setSidebarWidth(newWidth);
    }
  }, [setSidebarWidth]);

  // Mutations
  const initializeUser = useMutation((api as any).messages.initializeUser);
  const addSearchHistory = useMutation(api.searchHistory.addForCurrentUser);
  const sendMessage = useMutation((api as any).messages.sendMessage);
  const getOrCreateConversation = useMutation((api as any).messages.getOrCreateConversation);
  const updatePresence = useMutation((api as any).users.updatePresence);
  const markAsRead = useMutation((api as any).messages.markAsRead);
  const hideConversation = useMutation((api as any).messages.hideConversation);
  const createGroup = useMutation((api as any).messages.createGroup);
  const acceptGroupInvite = useMutation((api as any).messages.acceptGroupInvite);
  const rejectGroupInvite = useMutation((api as any).messages.rejectGroupInvite);
  const sendGroupInvite = useMutation((api as any).messages.sendGroupInvite);
  const sendChatInvite = useMutation((api as any).messages.sendChatInvite);
  const acceptChatInvite = useMutation((api as any).messages.acceptChatInvite);
  const rejectChatInvite = useMutation((api as any).messages.rejectChatInvite);
  const generateUploadUrl = useMutation((api as any).files.generateUploadUrl);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Queries
  const currentUser = useQuery((api as any).users.getCurrentUser, {});
  const conversations = useQuery((api as any).messages.getConversations, {});
  const searchHistory = useQuery(api.searchHistory.getForCurrentUser, {});
  const pendingInvites = useQuery((api as any).messages.getPendingInvites, {});
  const suggestedUsers = useQuery((api as any).messages.getSuggestedUsers, {});
  const allUsers = useQuery(api.users.listUsers, {});
  const pendingChatInvites = useQuery((api as any).messages.getPendingChatInvites, {});

  const userSearchResults = useQuery(
    searchValue.trim() !== "" ? (api as any).users.searchUsers : "skip",
    searchValue.trim() !== "" ? { query: searchValue } : "skip"
  );

  const messages = useQuery(
    selectedConversationId ? (api as any).messages.getMessagesForConversation : "skip",
    selectedConversationId ? { conversationId: selectedConversationId as any } : "skip"
  );

  // Get fresh conversation data with current online status
  const selectedConversationData = useQuery(
    selectedConversationId ? (api as any).messages.getConversationById : "skip",
    selectedConversationId ? { conversationId: selectedConversationId as any } : "skip"
  );

  const getGroupMembers = useQuery(
    selectedConversationId && (conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup)
      ? (api as any).messages.getGroupMembers
      : "skip",
    selectedConversationId && (conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup)
      ? { conversationId: selectedConversationId as any }
      : "skip"
  );

  // Heartbeat
  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => updatePresence(), 15000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  // Mark as read
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead({ conversationId: selectedConversationId as any });
    }
  }, [selectedConversationId, messages, markAsRead]);

  // Handlers
  const handleSearchSubmit = async () => {
    const normalized = searchValue.trim();
    if (normalized) await addSearchHistory({ query: normalized });
  };

  const handleSelectChat = (id: string) => {
    setSelectedConversationId(id);
    clearSearch();
  };

  const handleSelectUser = async (userId: string) => {
    const id = await getOrCreateConversation({ otherUserId: userId as any });
    setSelectedConversationId(id);
    clearSearch();
  };

  const handleSendMessage = async (
    body: string, 
    replyTo?: string, 
    replyToUser?: string,
    file?: File,
    mediaType?: 'image' | 'video'
  ) => {
    if (!selectedConversationId || (!body.trim() && !file) || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      let mediaStorageId = undefined;
      
      // Upload file if provided
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const uploadResult = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await uploadResult.json();
        mediaStorageId = storageId;
      }
      
      await sendMessage({ 
        conversationId: selectedConversationId as any, 
        body: body || '',
        replyTo, 
        replyToUser,
        mediaStorageId,
        mediaType
      });
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) return;
    const id = await createGroup({ participantIds: selectedParticipants as any, name: groupName });
    setSelectedConversationId(id);
    resetGroupCreation();
  };

  const handleSendGroupInvites = async (userIds: string[], message?: string) => {
    if (!selectedConversationId) return;
    await sendGroupInvite({ conversationId: selectedConversationId as any, invitedUserIds: userIds as any, message });
  };

  const handleSendChatInvite = async (userId: string) => {
    try {
      await sendChatInvite({ toUserId: userId as any });
    } catch (err) {
      console.error("Failed to send chat invite:", err);
    }
  };

  // UI Mapping
  const searchItems = (userSearchResults ?? []).map((u: any) => ({
    name: u.name || "User",
    message: u.email || "",
    time: "",
    conversationId: u._id,
    isUser: true,
    isOnline: u.lastSeenAt ? (Date.now() - u.lastSeenAt) < 60000 : false,
    imageUrl: u.imageUrl,
  }));

  const chatItems = (conversations ?? []).map((conv: any) => ({
    name: conv.name,
    message: conv.isTyping ? "Typing..." : (conv.lastMessage || "No messages yet"),
    time: formatMessageTimestamp(conv.lastMessageAt),
    active: selectedConversationId === conv._id,
    conversationId: conv._id,
    isUser: false,
    isOnline: conv.isOnline,
    unreadCount: conv.unreadCount || 0,
    imageUrl: conv.imageUrl,
    isGroup: conv.isGroup,
    memberCount: conv.memberCount,
  }));

  const displayItems = searchValue.trim() !== "" ? searchItems : chatItems;

  return (
    <main className="flex h-screen flex-col bg-zinc-100 dark:bg-zinc-950 relative">
      <MainHeader />

      <div className="flex min-h-0 flex-1 relative overflow-hidden">
        <div
          className={`lg:flex shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 group/sidebar relative ${selectedConversationId ? 'hidden' : 'flex w-full'}`}
          style={{ width: isLargeScreen ? `${sidebarWidth}px` : undefined }}
        >
          <GroupInvitesPanel
            invites={pendingInvites ?? []}
            onAccept={async (id) => setSelectedConversationId(await acceptGroupInvite({ inviteId: id as any }))}
            onReject={(id) => rejectGroupInvite({ inviteId: id as any })}
          />
          <ChatInvitesPanel
            invites={pendingChatInvites ?? []}
            onAccept={async (id) => setSelectedConversationId(await acceptChatInvite({ inviteId: id as any }))}
            onReject={(id) => rejectChatInvite({ inviteId: id as any })}
          />
          <ChatSidebar
            userName={(currentUser?.name || user?.firstName || "User").split(',')[0].trim()}
            userStatus="Online"
            imageUrl={currentUser?.imageUrl}
            sectionTitle={searchValue.trim() !== "" ? "SEARCH RESULTS" : "MESSAGES"}
            searchPlaceholder="Search people..."
            chats={displayItems as any}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSearchSubmit={handleSearchSubmit}
            searchHistory={searchHistory ?? []}
            onHistorySelect={(v) => { setSearchValue(v); addSearchHistory({ query: v }); }}
            onChatSelect={(id) => {
              const item = displayItems.find((i: any) => i.conversationId === id);
              item?.isUser ? handleSelectUser(id) : handleSelectChat(id);
            }}
            onCreateGroup={() => setIsGroupModalOpen(true)}
            suggestedUsers={suggestedUsers}
            onUserSelect={handleSelectUser}
            onSendChatInvite={handleSendChatInvite}
            pendingChatInvites={pendingChatInvites}
            onAcceptChatInvite={async (id) => setSelectedConversationId(await acceptChatInvite({ inviteId: id as any }))}
            onRejectChatInvite={(id) => rejectChatInvite({ inviteId: id as any })}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <div onMouseDown={startResizing} className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors hidden lg:block" />
        </div>

        <div className={`flex min-h-0 flex-1 flex-col min-w-0 ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConversationId && messages ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversationId(null)}
              selectedConversation={selectedConversationData || conversations?.find((c: any) => c._id === selectedConversationId)}
              currentUserId={currentUser?._id}
              isSending={isSending}
              error={error}
              isGroupChat={selectedConversationData?.isGroup ?? conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup}
              groupMembers={getGroupMembers ?? []}
              onAddMembers={() => setIsAddMembersOpen(true)}
              onDelete={async () => {
                await hideConversation({ conversationId: selectedConversationId as any });
                setSelectedConversationId(null);
              }}
            />
          ) : (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#efeae2]/30 dark:bg-zinc-800/30 space-y-4">
              <div className="h-20 w-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-3xl shadow-sm">💬</div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Select a chat to start messaging</p>
            </div>
          )}
        </div>

        {isExtraLargeScreen && (
          <ChatRightSidebar onChatSelect={handleSelectChat} />
        )}
      </div>

      <GroupCreateModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        allUsers={allUsers}
        onCreate={handleCreateGroup}
      />

      {isAddMembersOpen && selectedConversationId && (
        <GroupMembersModal
          isOpen={isAddMembersOpen}
          groupName={conversations?.find((c: any) => c._id === selectedConversationId)?.name || "Group"}
          currentMembers={getGroupMembers ?? []}
          allUsers={allUsers ?? []}
          onClose={() => setIsAddMembersOpen(false)}
          onInvite={handleSendGroupInvites}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        uiScale={uiScale}
        onScaleChange={setUIScale}
        theme={theme}
        onThemeChange={setTheme}
      />
    </main>
  );
}