import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user (read-only for queries)
async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  return user || null;
}

// Initialize or update user (call from mutations)
async function initializeOrUpdateUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (user) {
    await ctx.db.patch(user._id, {
      name: identity.name,
      email: identity.email,
      imageUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    });
  } else {
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
      imageUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    });
    user = await ctx.db.get(userId);
  }

  return user;
}

// Initialize user on first login (call this first)
export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await initializeOrUpdateUser(ctx);
  },
});

export const createGroup = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const now = Date.now();

    // Only the creator is added initially — others get invites
    const conversationId = await ctx.db.insert("conversations", {
      participants: [currentUser._id],
      isGroup: true,
      name: args.name,
      lastMessageAt: now,
    });

    // Send invites to selected participants
    for (const userId of args.participantIds) {
      if (userId === currentUser._id) continue;

      await ctx.db.insert("groupChatInvites", {
        conversationId,
        invitedUserId: userId,
        invitedByUserId: currentUser._id,
        status: "pending",
        createdAt: now,
      });
    }

    return conversationId;
  },
});

// Get all conversations for current user (DMs)
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const conversations = await ctx.db
      .query("conversations")
      .collect();

    // Include all conversations where current user is a participant (including empty DMs)
    const userConversations = conversations.filter((c: any) =>
      c.participants.map((p: any) => p.toString()).includes(currentUser._id.toString()) &&
      !(c.hiddenBy || []).map((h: any) => h.toString()).includes(currentUser._id.toString())
    );

    // Sort by most recent message, showing new conversations at the bottom
    const sorted = userConversations.sort((a, b) => {
      const aTime = a.lastMessageAt || 0;
      const bTime = b.lastMessageAt || 0;
      return bTime - aTime;
    });

    const withUserInfo = await Promise.all(
      sorted.map(async (conv: any) => {
        let name = conv.name;
        let imageUrl = undefined;
        let otherUserId = undefined;

        if (!conv.isGroup) {
          otherUserId = conv.participants.find((id: any) => id !== currentUser._id);
          const otherUser: any = await ctx.db.get(otherUserId);
          name = otherUser?.name || "User";
          imageUrl = otherUser?.imageUrl;
        }

        // Count unread messages
        const lastReadAt = conv.lastReadAt?.[currentUser._id] || 0;
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation_createdAt", (q: any) =>
            q.eq("conversationId", conv._id).gt("createdAt", lastReadAt)
          )
          .collect();

        const unreadCount = unreadMessages.filter((m: any) => m.senderId !== currentUser._id).length;

        // Fetch isTyping for group or DM
        let isTyping = false;
        if (conv.typing) {
          const now = Date.now();
          isTyping = Object.entries(conv.typing).some(([uid, time]: [string, any]) =>
            uid !== currentUser._id.toString() && (now - time) < 3000
          );
        }

        // Determine online status for DMs
        let isOnline = false;
        if (!conv.isGroup && otherUserId) {
          const otherUser: any = await ctx.db.get(otherUserId);
          if (otherUser?.lastSeenAt) {
            isOnline = (Date.now() - otherUser.lastSeenAt) < 60000;
          }
        }

        return {
          _id: conv._id,
          name: name || "Group",
          imageUrl,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId,
          isGroup: !!conv.isGroup,
          isOnline,
          memberCount: conv.participants.length,
          unreadCount,
          isTyping,
        };
      })
    );

    return withUserInfo;
  },
});

// Get a single conversation by ID with fresh online status
export const getConversationById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return null;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;

    // Check if current user is in this conversation
    if (!conv.participants.some((p: any) => p.toString() === currentUser._id.toString())) {
      return null;
    }

    let name = conv.name;
    let imageUrl = undefined;
    let otherUserId = undefined;

    if (!conv.isGroup) {
      otherUserId = conv.participants.find((id: any) => id.toString() !== currentUser._id.toString());
      if (otherUserId) {
        const otherUser: any = await ctx.db.get(otherUserId);
        name = otherUser?.name || "User";
        imageUrl = otherUser?.imageUrl;
      }
    }

    // Determine online status with fresh data
    let isOnline = false;
    if (!conv.isGroup && otherUserId) {
      const otherUser: any = await ctx.db.get(otherUserId);
      if (otherUser?.lastSeenAt) {
        isOnline = (Date.now() - otherUser.lastSeenAt) < 60000;
      }
    }

    return {
      _id: conv._id,
      name: name || "Group",
      imageUrl,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      otherUserId,
      isGroup: !!conv.isGroup,
      isOnline,
      memberCount: conv.participants.length,
    };
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== currentUser._id) return;

    await ctx.db.patch(args.messageId, { deleted: true });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions || {};
    const userId = currentUser._id;

    if (reactions[userId] === args.emoji) {
      // Remove if same emoji
      const { [userId]: _, ...rest } = reactions;
      await ctx.db.patch(args.messageId, { reactions: rest });
    } else {
      // Set/update emoji
      await ctx.db.patch(args.messageId, {
        reactions: { ...reactions, [userId]: args.emoji }
      });
    }
  },
});

// Get messages for a specific conversation
export const getMessagesForConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);

        // Format reactions as an array of { emoji, count } for Convex compatibility
        const reactions: { emoji: string; count: number }[] = [];
        if (msg.reactions) {
          const counts: Record<string, number> = {};
          Object.values(msg.reactions).forEach(emoji => {
            counts[emoji] = (counts[emoji] || 0) + 1;
          });
          Object.entries(counts).forEach(([emoji, count]) => {
            reactions.push({ emoji, count });
          });
        }

        return {
          ...msg,
          body: msg.deleted ? "This message was deleted" : msg.body,
          sender: {
            _id: sender?._id,
            name: sender?.name || "User",
            imageUrl: sender?.imageUrl
          },
          reactions,
          userReaction: currentUser ? msg.reactions?.[currentUser._id] : undefined,
          replyTo: msg.replyTo,
          replyToUser: msg.replyToUser,
        };
      })
    );
  },
});

// Send a message in a conversation
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
    replyTo: v.optional(v.string()),
    replyToUser: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const normalized = args.body.trim();

    // Allow empty body if there's media
    if (!normalized && !args.mediaStorageId) {
      return null;
    }

    const now = Date.now();
    
    // Get media URL if storage ID is provided
    let mediaUrl = undefined;
    if (args.mediaStorageId) {
      const url = await ctx.storage.getUrl(args.mediaStorageId);
      mediaUrl = url || undefined;
    }

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      body: normalized || (args.mediaType ? `Sent ${args.mediaType}` : ''),
      createdAt: now,
      replyTo: args.replyTo,
      replyToUser: args.replyToUser,
      mediaUrl,
      mediaType: args.mediaType,
      mediaStorageId: args.mediaStorageId,
    });

    // Update conversation's last message
    const lastMessageText = normalized || (args.mediaType === 'image' ? '📷 Photo' : '🎥 Video');
    await ctx.db.patch(args.conversationId, {
      lastMessage: lastMessageText,
      lastMessageAt: now,
      lastMessageSenderId: currentUser._id,
      // Clear typing for this user when they send a message
      typing: {
        ...((await ctx.db.get(args.conversationId))?.typing || {}),
        [currentUser._id]: 0,
      },
      // Automatically mark as read for the sender
      lastReadAt: {
        ...((await ctx.db.get(args.conversationId))?.lastReadAt || {}),
        [currentUser._id]: now,
      },
      hiddenBy: [], // Reset hidden status when a new message is sent
    });

    return messageId;
  },
});

// Hide a conversation (soft delete for the user)
export const hideConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) return;

    const hiddenBy = conversation.hiddenBy || [];
    if (!hiddenBy.map((id: any) => id.toString()).includes(currentUser._id.toString())) {
      await ctx.db.patch(args.conversationId, {
        hiddenBy: [...hiddenBy, currentUser._id],
      });
    }
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    await ctx.db.patch(args.conversationId, {
      lastReadAt: {
        ...(conversation.lastReadAt || {}),
        [currentUser._id]: Date.now(),
      },
    });
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    await ctx.db.patch(args.conversationId, {
      typing: {
        ...(conversation.typing || {}),
        [currentUser._id]: Date.now(),
      },
    });
  },
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    const newTyping = { ...(conversation.typing || {}) };
    delete newTyping[currentUser._id];

    await ctx.db.patch(args.conversationId, {
      typing: newTyping,
    });
  },
});

// Create or get conversation with another user
export const getOrCreateConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);

    const participants = [currentUser._id, args.otherUserId].sort();

    // Check if conversation already exists
    const existing = (await ctx.db.query("conversations").collect()).find(
      (conv: any) => {
        const convParticipants = conv.participants.sort();
        return (
          convParticipants.length === 2 &&
          convParticipants[0] === participants[0] &&
          convParticipants[1] === participants[1]
        );
      }
    );

    if (existing) {
      return existing._id;
    }

    // Create new conversation
    return await ctx.db.insert("conversations", {
      participants,
      lastMessageAt: Date.now(),
      lastMessage: undefined,
    });
  },
});

export const getSuggestedUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const currentUserIdStr = currentUser._id.toString();

    // Get all conversations for current user
    const userConversations = (await ctx.db.query("conversations").collect()).filter((c: any) =>
      c.participants.some((p: any) => p.toString() === currentUserIdStr)
    );

    const existingParticipantIds = new Set(
      userConversations.flatMap((c: any) =>
        c.participants.map((id: any) => id.toString())
      )
    );

    // Get pending invites sent by current user
    const pendingInvites = await ctx.db
      .query("chatInvites")
      .withIndex("by_from_user_status", (q: any) =>
        q.eq("fromUserId", currentUser._id).eq("status", "pending")
      )
      .collect();

    const sentInviteUserIds = new Set(
      pendingInvites.map((inv: any) => inv.toUserId.toString())
    );

    const allUsers = await ctx.db.query("users").collect();

    // Show all users except current user, mark if already in conversation or has pending invite
    return allUsers
      .filter((u: any) => u._id.toString() !== currentUserIdStr)
      .slice(0, 10)
      .map((u: any) => {
        const userIdStr = u._id.toString();
        const isInConversation = existingParticipantIds.has(userIdStr);
        const hasPendingInvite = sentInviteUserIds.has(userIdStr);

        return {
          ...u,
          isInConversation,
          hasPendingInvite,
        };
      });
  },
});

// Send group chat invites
export const sendGroupInvite = mutation({
  args: {
    conversationId: v.id("conversations"),
    invitedUserIds: v.array(v.id("users")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation || !conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a member of this group");
    }

    const now = Date.now();
    const inviteIds: any[] = [];

    for (const userId of args.invitedUserIds) {
      // Check if already a member
      if (conversation.participants.includes(userId)) {
        continue;
      }

      // Check if invite already exists
      const existingInvites = await ctx.db
        .query("groupChatInvites")
        .collect();

      const existingInvite = existingInvites.find((invite: any) =>
        invite.conversationId === args.conversationId &&
        invite.invitedUserId === userId &&
        invite.status === "pending"
      );

      if (!existingInvite) {
        const inviteId = await ctx.db.insert("groupChatInvites", {
          conversationId: args.conversationId,
          invitedUserId: userId,
          invitedByUserId: currentUser._id,
          status: "pending",
          message: args.message,
          createdAt: now,
        });
        inviteIds.push(inviteId);
      }
    }

    return inviteIds;
  },
});

// Get pending invites for current user
export const getPendingInvites = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const invites = await ctx.db
      .query("groupChatInvites")
      .withIndex("by_invited_user_status", (q: any) =>
        q.eq("invitedUserId", currentUser._id).eq("status", "pending")
      )
      .collect();

    return Promise.all(
      invites.map(async (invite: any) => {
        const conversation: any = await ctx.db.get(invite.conversationId);
        const invitedBy: any = await ctx.db.get(invite.invitedByUserId);

        // Find other people invited to the same group
        const allInvites = await ctx.db.query("groupChatInvites").collect();
        const otherInvitedDetails = await Promise.all(
          allInvites
            .filter((i: any) => i.conversationId === invite.conversationId && i.invitedUserId !== currentUser._id && i.status === "pending")
            .slice(0, 3)
            .map(async (i: any) => {
              const u: any = await ctx.db.get(i.invitedUserId);
              return u?.name || "User";
            })
        );

        return {
          _id: invite._id,
          conversationId: invite.conversationId,
          conversationName: conversation?.name || "Group Chat",
          conversationImage: undefined,
          invitedBy: invitedBy?.name || "User",
          invitedByImage: invitedBy?.imageUrl,
          otherInvitedUsers: otherInvitedDetails,
          message: invite.message,
          status: invite.status,
          createdAt: invite.createdAt,
        };
      })
    );
  },
});

// Accept group chat invite
export const acceptGroupInvite = mutation({
  args: {
    inviteId: v.id("groupChatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.invitedUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    const conversation = await ctx.db.get(invite.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Add user to conversation participants
    const updatedParticipants = Array.from(
      new Set([...conversation.participants, currentUser._id])
    );

    await ctx.db.patch(invite.conversationId, {
      participants: updatedParticipants,
    });

    // Mark invite as accepted
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    return invite.conversationId;
  },
});

// Reject group chat invite
export const rejectGroupInvite = mutation({
  args: {
    inviteId: v.id("groupChatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.invitedUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    await ctx.db.patch(args.inviteId, {
      status: "rejected",
      respondedAt: Date.now(),
    });
  },
});

// Get group members
export const getGroupMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    return Promise.all(
      conversation.participants.map(async (userId: any) => {
        const user: any = await ctx.db.get(userId);
        return {
          _id: user?._id,
          name: user?.name || "User",
          imageUrl: user?.imageUrl,
          email: user?.email,
        };
      })
    );
  },
});

// ======= CHAT INVITE REQUEST (DM) =======

// Send a chat invite request to another user
export const sendChatInvite = mutation({
  args: {
    toUserId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);

    if (args.toUserId === currentUser._id) {
      throw new Error("Cannot send invite to yourself");
    }

    // Check if a conversation already exists between these users
    const conversations = await ctx.db.query("conversations").collect();
    const existingConv = conversations.find((conv: any) => {
      const p = conv.participants.map((id: any) => id.toString()).sort();
      const target = [currentUser._id.toString(), args.toUserId.toString()].sort();
      return p.length === 2 && p[0] === target[0] && p[1] === target[1];
    });

    if (existingConv) {
      throw new Error("Conversation already exists");
    }

    // Check if a pending invite already exists (in either direction)
    const existingInvites = await ctx.db.query("chatInvites").collect();
    const hasPending = existingInvites.some((inv: any) =>
      inv.status === "pending" && (
        (inv.fromUserId === currentUser._id && inv.toUserId === args.toUserId) ||
        (inv.fromUserId === args.toUserId && inv.toUserId === currentUser._id)
      )
    );

    if (hasPending) {
      throw new Error("A pending invite already exists");
    }

    return await ctx.db.insert("chatInvites", {
      fromUserId: currentUser._id,
      toUserId: args.toUserId,
      status: "pending",
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

// Get pending chat invites for the current user
export const getPendingChatInvites = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const invites = await ctx.db
      .query("chatInvites")
      .withIndex("by_to_user_status", (q: any) =>
        q.eq("toUserId", currentUser._id).eq("status", "pending")
      )
      .collect();

    return Promise.all(
      invites.map(async (invite: any) => {
        const fromUser: any = await ctx.db.get(invite.fromUserId);
        return {
          _id: invite._id,
          fromUserId: invite.fromUserId,
          fromUserName: fromUser?.name || "User",
          fromUserImage: fromUser?.imageUrl,
          fromUserOnline: fromUser?.lastSeenAt ? (Date.now() - fromUser.lastSeenAt) < 60000 : false,
          message: invite.message,
          status: invite.status,
          createdAt: invite.createdAt,
        };
      })
    );
  },
});

// Accept a chat invite — creates the DM conversation
export const acceptChatInvite = mutation({
  args: {
    inviteId: v.id("chatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.toUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    // Create the DM conversation
    const participants = [currentUser._id, invite.fromUserId].sort();

    // Check if conversation already exists (edge case)
    const conversations = await ctx.db.query("conversations").collect();
    const existing = conversations.find((conv: any) => {
      const p = conv.participants.sort();
      return p.length === 2 && p[0] === participants[0] && p[1] === participants[1];
    });

    let conversationId;
    if (existing) {
      conversationId = existing._id;
    } else {
      conversationId = await ctx.db.insert("conversations", {
        participants,
        lastMessageAt: Date.now(),
        lastMessage: undefined,
      });
    }

    // Mark invite as accepted
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    return conversationId;
  },
});

// Reject a chat invite
export const rejectChatInvite = mutation({
  args: {
    inviteId: v.id("chatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.toUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    await ctx.db.patch(args.inviteId, {
      status: "rejected",
      respondedAt: Date.now(),
    });
  },
});
