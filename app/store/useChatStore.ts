import { create } from 'zustand';

interface ChatState {
    // Conversation state
    selectedConversationId: string | null;
    setSelectedConversationId: (id: string | null) => void;
    
    // Search state
    searchValue: string;
    setSearchValue: (value: string) => void;
    
    // Message sending state
    isSending: boolean;
    setIsSending: (sending: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    
    // File upload state
    uploadingFile: boolean;
    setUploadingFile: (uploading: boolean) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    filePreview: string | null;
    setFilePreview: (preview: string | null) => void;
    
    // Modal states
    isGroupModalOpen: boolean;
    setIsGroupModalOpen: (isOpen: boolean) => void;
    isAddMembersOpen: boolean;
    setIsAddMembersOpen: (isOpen: boolean) => void;
    
    // Group creation state
    groupName: string;
    setGroupName: (name: string) => void;
    selectedParticipants: string[];
    setSelectedParticipants: (participants: string[]) => void;
    
    // Responsive layout state
    isLargeScreen: boolean;
    setIsLargeScreen: (isLarge: boolean) => void;
    isExtraLargeScreen: boolean;
    setIsExtraLargeScreen: (isExtraLarge: boolean) => void;
    
    // Actions
    clearSearch: () => void;
    resetGroupCreation: () => void;
    handleResize: (width: number) => void;
    clearFileSelection: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    // Initial state
    selectedConversationId: null,
    searchValue: '',
    isSending: false,
    error: null,
    uploadingFile: false,
    selectedFile: null,
    filePreview: null,
    isGroupModalOpen: false,
    isAddMembersOpen: false,
    groupName: '',
    selectedParticipants: [],
    isLargeScreen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    isExtraLargeScreen: typeof window !== 'undefined' ? window.innerWidth >= 1280 : false,
    
    // Setters
    setSelectedConversationId: (id) => set({ selectedConversationId: id }),
    setSearchValue: (value) => set({ searchValue: value }),
    setIsSending: (sending) => set({ isSending: sending }),
    setError: (error) => set({ error }),
    setUploadingFile: (uploading) => set({ uploadingFile: uploading }),
    setSelectedFile: (file) => set({ selectedFile: file }),
    setFilePreview: (preview) => set({ filePreview: preview }),
    setIsGroupModalOpen: (isOpen) => set({ isGroupModalOpen: isOpen }),
    setIsAddMembersOpen: (isOpen) => set({ isAddMembersOpen: isOpen }),
    setGroupName: (name) => set({ groupName: name }),
    setSelectedParticipants: (participants) => set({ selectedParticipants: participants }),
    setIsLargeScreen: (isLarge) => set({ isLargeScreen: isLarge }),
    setIsExtraLargeScreen: (isExtraLarge) => set({ isExtraLargeScreen: isExtraLarge }),
    
    // Actions
    clearSearch: () => set({ searchValue: '' }),
    resetGroupCreation: () => set({ 
        groupName: '', 
        selectedParticipants: [],
        isGroupModalOpen: false 
    }),
    handleResize: (width: number) => set({ 
        isLargeScreen: width >= 1024,
        isExtraLargeScreen: width >= 1280
    }),
    clearFileSelection: () => set({ 
        selectedFile: null, 
        filePreview: null 
    }),
}));
