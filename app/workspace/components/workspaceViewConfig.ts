import { BoardLabelColor, JiraIssueType, MeetingStatus, WorkflowTemplate } from "../../store/useWorkspaceStore";

export type WorkspaceRouteMode = "execution" | "delivery" | "collab" | "rituals";

export const ROUTE_LABELS: Record<WorkspaceRouteMode, string> = {
  execution: "Execution Hub",
  delivery: "Delivery Command",
  collab: "Collaboration Stream",
  rituals: "Ritual Operations",
};

export const ROUTE_DESCRIPTIONS: Record<WorkspaceRouteMode, string> = {
  execution: "Priority board for active work, blockers, and shipping momentum.",
  delivery: "Issue-focused command center for planning, quality, and release readiness.",
  collab: "Unified communication stream for decisions, updates, and async coordination.",
  rituals: "Cadence board for planning sessions, live reviews, and follow-through.",
};

export const WORKFLOW_LABELS: Record<WorkflowTemplate, string> = {
  slack: "Messaging-Led",
  jira: "Delivery-Led",
  hybrid: "Balanced Ops",
};

export const MEETING_COLUMNS: Array<{ id: MeetingStatus; label: string }> = [
  { id: "planned", label: "Planned" },
  { id: "live", label: "Live" },
  { id: "done", label: "Done" },
];

export const LABEL_CHOICES: BoardLabelColor[] = [
  "slate",
  "red",
  "amber",
  "emerald",
  "sky",
  "indigo",
  "pink",
];

export const LABEL_BADGE_STYLE: Record<BoardLabelColor, string> = {
  slate: "bg-slate-100 text-slate-700 border border-slate-300",
  red: "bg-red-100 text-red-700 border border-red-300",
  amber: "bg-amber-100 text-amber-700 border border-amber-300",
  emerald: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  sky: "bg-sky-100 text-sky-700 border border-sky-300",
  indigo: "bg-indigo-100 text-indigo-700 border border-indigo-300",
  pink: "bg-pink-100 text-pink-700 border border-pink-300",
};

export const ISSUE_FILTER_OPTIONS: Array<{ value: "all" | JiraIssueType; label: string }> = [
  { value: "all", label: "All Issue Types" },
  { value: "story", label: "Stories" },
  { value: "task", label: "Tasks" },
  { value: "bug", label: "Bugs" },
  { value: "epic", label: "Epics" },
];

export const CARD_COVER_CHOICES = [
  "#dc2626",
  "#ea580c",
  "#0d9488",
  "#0284c7",
  "#4f46e5",
  "#db2777",
  "#18181b",
];
