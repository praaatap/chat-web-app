"use client";

import { useMemo, useState } from "react";
import {
  BoardCard,
  BoardLabelColor,
  JiraIssueType,
  MeetingStatus,
  useWorkspaceStore,
  WorkspaceSnapshot,
} from "../../store/useWorkspaceStore";
import { decryptJsonWithPassphrase, encryptJsonWithPassphrase } from "../../lib/workspaceCrypto";
import { MEETING_COLUMNS, WorkspaceRouteMode } from "./workspaceViewConfig";

type CardFocus = {
  listId: string;
  cardId: string;
};

export function useWorkspaceShellState(routeMode: WorkspaceRouteMode) {
  const store = useWorkspaceStore();

  const [jiraIssueFilter, setJiraIssueFilter] = useState<"all" | JiraIssueType>("all");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCardTitleByList, setNewCardTitleByList] = useState<Record<string, string>>({});
  const [activeCard, setActiveCard] = useState<CardFocus | null>(null);
  const [checklistDraft, setChecklistDraft] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<BoardLabelColor>("indigo");
  const [streamMessage, setStreamMessage] = useState("");
  const [streamChannel, setStreamChannel] = useState("general");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingOwner, setMeetingOwner] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [meetingActions, setMeetingActions] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [sprintNameDraft, setSprintNameDraft] = useState(store.sprint.name);
  const [sprintGoalDraft, setSprintGoalDraft] = useState(store.sprint.goal);
  const [sprintEndDraft, setSprintEndDraft] = useState(store.sprint.endDate);

  const activeMainView: "kanban" | "rituals" = routeMode === "rituals" ? "rituals" : "kanban";

  const selectedChannel =
    store.channels.find((channel) => channel.id === store.selectedChannelId) || store.channels[0];
  const selectedBoard =
    store.boards.find((board) => board.id === store.selectedBoardId) || store.boards[0];

  const boardLists = useMemo(() => {
    if (!selectedBoard) return [];
    return selectedBoard.listOrder
      .map((listId) => selectedBoard.lists[listId])
      .filter(Boolean)
      .filter((list) => !list.archived);
  }, [selectedBoard]);

  const visibleCardsByList = useMemo(() => {
    if (!selectedBoard) return {} as Record<string, BoardCard[]>;

    const query = searchQuery.trim().toLowerCase();
    const result: Record<string, BoardCard[]> = {};

    boardLists.forEach((list) => {
      result[list.id] = list.cardIds
        .map((cardId) => selectedBoard.cards[cardId])
        .filter(Boolean)
        .filter((card) => !card.archived)
        .filter((card) => {
          if (routeMode === "delivery" && jiraIssueFilter !== "all" && card.issueType !== jiraIssueFilter) {
            return false;
          }

          if (!query) return true;
          return card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query);
        });
    });

    return result;
  }, [selectedBoard, boardLists, searchQuery, routeMode, jiraIssueFilter]);

  const activeCardData = useMemo(() => {
    if (!selectedBoard || !activeCard) return null;
    return selectedBoard.cards[activeCard.cardId] || null;
  }, [selectedBoard, activeCard]);

  const summary = useMemo(() => {
    if (!selectedBoard) return { channels: store.channels.length, cards: 0, dueSoon: 0, bugs: 0 };

    const cards = Object.values(selectedBoard.cards).filter((card) => !card.archived);
    const dueSoon = cards.filter((card) => {
      if (!card.dueDate) return false;
      const due = new Date(card.dueDate);
      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      return due <= inTwoDays;
    }).length;

    const bugs = cards.filter((card) => card.issueType === "bug").length;
    return { channels: store.channels.length, cards: cards.length, dueSoon, bugs };
  }, [store.channels.length, selectedBoard]);

  const meetingsByStatus = useMemo(() => {
    return MEETING_COLUMNS.reduce((acc, column) => {
      acc[column.id] = store.meetings.filter((meeting) => meeting.status === column.id);
      return acc;
    }, {} as Record<MeetingStatus, typeof store.meetings>);
  }, [store.meetings]);

  const handleAddChannel = () => {
    store.addChannel(channelName, channelDescription);
    setChannelName("");
    setChannelDescription("");
  };

  const handleAddBoard = () => {
    store.addBoard(newBoardName);
    setNewBoardName("");
  };

  const handleAddList = () => {
    if (!selectedBoard) return;
    store.addBoardList(selectedBoard.id, newListTitle);
    setNewListTitle("");
  };

  const handleAddCard = (listId: string) => {
    if (!selectedBoard) return;
    const title = newCardTitleByList[listId] || "";
    store.addBoardCard(selectedBoard.id, listId, { title });
    setNewCardTitleByList((prev) => ({ ...prev, [listId]: "" }));
  };

  const handleCardDrop = (event: React.DragEvent<HTMLElement>, toListId: string) => {
    if (!selectedBoard) return;

    event.preventDefault();
    const payload = event.dataTransfer.getData("application/x-card");
    if (!payload) return;

    try {
      const parsed = JSON.parse(payload) as { cardId: string; fromListId: string };
      store.moveBoardCard(selectedBoard.id, parsed.cardId, parsed.fromListId, toListId);
      setActiveCard({ listId: toListId, cardId: parsed.cardId });
    } catch {
      // Ignore invalid drag payloads.
    }
  };

  const handleSaveSprint = () => {
    store.setSprintPlan({ name: sprintNameDraft, goal: sprintGoalDraft, endDate: sprintEndDraft });
    setStatusMessage("Sprint plan updated.");
  };

  const handleAddMeeting = () => {
    store.addMeeting({
      title: meetingTitle,
      owner: meetingOwner,
      date: meetingDate,
      agenda: meetingAgenda,
      actionItems: meetingActions,
      status: "planned",
    });

    setMeetingTitle("");
    setMeetingOwner("");
    setMeetingDate("");
    setMeetingAgenda("");
    setMeetingActions("");
  };

  const handleExportEncrypted = async () => {
    try {
      setStatusMessage("");
      setIsEncrypting(true);
      const snapshot = store.getExportData();
      const encrypted = await encryptJsonWithPassphrase(snapshot, passphrase);

      const file = new Blob([encrypted], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `workspace-backup-${Date.now()}.pulse`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setStatusMessage("Encrypted backup exported successfully.");
    } catch {
      setStatusMessage("Could not export encrypted backup. Check passphrase and try again.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleImportEncrypted = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatusMessage("");
      setIsEncrypting(true);
      const content = await file.text();
      const snapshot = await decryptJsonWithPassphrase<WorkspaceSnapshot>(content, passphrase);
      store.replaceWorkspaceData(snapshot);
      setStatusMessage("Encrypted backup imported.");
    } catch {
      setStatusMessage("Import failed. Wrong passphrase or invalid backup file.");
    } finally {
      setIsEncrypting(false);
      event.target.value = "";
    }
  };

  const handlePostUpdate = () => {
    store.addSlackUpdate(streamChannel, streamMessage);
    setStreamMessage("");
  };

  return {
    store,
    routeMode,
    activeMainView,
    jiraIssueFilter,
    setJiraIssueFilter,
    channelName,
    setChannelName,
    channelDescription,
    setChannelDescription,
    newBoardName,
    setNewBoardName,
    newListTitle,
    setNewListTitle,
    searchQuery,
    setSearchQuery,
    newCardTitleByList,
    setNewCardTitleByList,
    activeCard,
    setActiveCard,
    checklistDraft,
    setChecklistDraft,
    newLabelName,
    setNewLabelName,
    newLabelColor,
    setNewLabelColor,
    streamMessage,
    setStreamMessage,
    streamChannel,
    setStreamChannel,
    meetingTitle,
    setMeetingTitle,
    meetingOwner,
    setMeetingOwner,
    meetingDate,
    setMeetingDate,
    meetingAgenda,
    setMeetingAgenda,
    meetingActions,
    setMeetingActions,
    passphrase,
    setPassphrase,
    statusMessage,
    isEncrypting,
    sprintNameDraft,
    setSprintNameDraft,
    sprintGoalDraft,
    setSprintGoalDraft,
    sprintEndDraft,
    setSprintEndDraft,
    selectedChannel,
    selectedBoard,
    boardLists,
    visibleCardsByList,
    activeCardData,
    summary,
    meetingsByStatus,
    handleAddChannel,
    handleAddBoard,
    handleAddList,
    handleAddCard,
    handleCardDrop,
    handleSaveSprint,
    handleAddMeeting,
    handleExportEncrypted,
    handleImportEncrypted,
    handlePostUpdate,
  };
}

export type WorkspaceShellState = ReturnType<typeof useWorkspaceShellState>;
