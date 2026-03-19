import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskStatus = "backlog" | "in_progress" | "review" | "done";

export type WorkspaceChannel = {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	lastMessageAt: number;
};

export type WorkspaceTask = {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	assignee: string;
	priority: "low" | "medium" | "high";
	dueDate?: string;
	tags: string[];
	createdAt: number;
};

export type WorkspaceSprint = {
	name: string;
	goal: string;
	endDate: string;
};

export type WorkflowTemplate = "slack" | "jira" | "hybrid";

export type BoardLabelColor =
	| "slate"
	| "red"
	| "amber"
	| "emerald"
	| "sky"
	| "indigo"
	| "pink";

export type BoardLabel = {
	id: string;
	name: string;
	color: BoardLabelColor;
};

export type BoardChecklistItem = {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
};

export type JiraIssueType = "story" | "task" | "bug" | "epic";

export type BoardCard = {
	id: string;
	title: string;
	description: string;
	jiraKey: string;
	issueType: JiraIssueType;
	storyPoints?: number;
	epic?: string;
	sprintName?: string;
	reporter?: string;
	dueDate?: string;
	members: string[];
	labels: string[];
	checklist: BoardChecklistItem[];
	coverColor?: string;
	archived: boolean;
	createdAt: number;
	updatedAt: number;
};

export type BoardList = {
	id: string;
	title: string;
	cardIds: string[];
	archived: boolean;
	createdAt: number;
};

export type WorkspaceBoard = {
	id: string;
	name: string;
	listOrder: string[];
	lists: Record<string, BoardList>;
	cards: Record<string, BoardCard>;
	labels: BoardLabel[];
	createdAt: number;
	updatedAt: number;
};

export type MeetingStatus = "planned" | "live" | "done";

export type WorkspaceMeeting = {
	id: string;
	title: string;
	date: string;
	owner: string;
	agenda: string;
	actionItems: string;
	status: MeetingStatus;
	createdAt: number;
};

export type SlackUpdate = {
	id: string;
	channel: string;
	message: string;
	author: string;
	createdAt: number;
};

export type WorkspaceActivity = {
	id: string;
	type: "channel" | "task" | "sprint" | "security";
	message: string;
	at: number;
};

export type WorkspaceSnapshot = {
	workspaceName: string;
	workflowTemplate: WorkflowTemplate;
	boards: WorkspaceBoard[];
	selectedBoardId: string;
	slackUpdates: SlackUpdate[];
	channels: WorkspaceChannel[];
	selectedChannelId: string;
	channelNotes: Record<string, string>;
	tasks: WorkspaceTask[];
	meetings: WorkspaceMeeting[];
	sprint: WorkspaceSprint;
	wipLimits: Record<TaskStatus, number>;
	activityLog: WorkspaceActivity[];
	lastUpdated: number;
};

type NewTaskInput = {
	title: string;
	description?: string;
	assignee?: string;
	priority?: "low" | "medium" | "high";
	dueDate?: string;
	tags?: string[];
};

type NewBoardCardInput = {
	title: string;
	description?: string;
	issueType?: JiraIssueType;
	storyPoints?: number;
	epic?: string;
	sprintName?: string;
	reporter?: string;
	dueDate?: string;
	members?: string[];
	labels?: string[];
	coverColor?: string;
};

type WorkspaceState = WorkspaceSnapshot & {
	setWorkspaceName: (name: string) => void;
	setWorkflowTemplate: (template: WorkflowTemplate) => void;
	addBoard: (name: string) => void;
	cloneBoard: (boardId: string) => void;
	selectBoard: (boardId: string) => void;
	renameBoard: (boardId: string, name: string) => void;
	deleteBoard: (boardId: string) => void;
	addBoardList: (boardId: string, title: string) => void;
	renameBoardList: (boardId: string, listId: string, title: string) => void;
	deleteBoardList: (boardId: string, listId: string) => void;
	addBoardCard: (boardId: string, listId: string, input: NewBoardCardInput) => void;
	moveBoardCard: (
		boardId: string,
		cardId: string,
		fromListId: string,
		toListId: string,
		toIndex?: number
	) => void;
	updateBoardCard: (
		boardId: string,
		cardId: string,
		payload: Partial<Omit<BoardCard, "id" | "createdAt">>
	) => void;
	deleteBoardCard: (boardId: string, cardId: string, fromListId: string) => void;
	addBoardLabel: (boardId: string, name: string, color: BoardLabelColor) => void;
	toggleCardLabel: (boardId: string, cardId: string, labelId: string) => void;
	addCardChecklistItem: (boardId: string, cardId: string, text: string) => void;
	toggleCardChecklistItem: (
		boardId: string,
		cardId: string,
		itemId: string
	) => void;
	removeCardChecklistItem: (
		boardId: string,
		cardId: string,
		itemId: string
	) => void;
	addSlackUpdate: (channel: string, message: string, author?: string) => void;
	deleteSlackUpdate: (updateId: string) => void;
	addChannel: (name: string, description?: string) => void;
	selectChannel: (channelId: string) => void;
	setChannelNote: (channelId: string, note: string) => void;
	setSprintPlan: (payload: WorkspaceSprint) => void;
	setWipLimit: (status: TaskStatus, limit: number) => void;
	addTask: (task: NewTaskInput) => void;
	setTaskStatus: (taskId: string, status: TaskStatus) => void;
	duplicateTask: (taskId: string) => void;
	deleteTask: (taskId: string) => void;
	archiveDoneTasks: () => void;
	addMeeting: (meeting: Omit<WorkspaceMeeting, "id" | "createdAt">) => void;
	setMeetingStatus: (meetingId: string, status: MeetingStatus) => void;
	updateMeetingNotes: (
		meetingId: string,
		payload: Partial<Pick<WorkspaceMeeting, "agenda" | "actionItems">>
	) => void;
	deleteMeeting: (meetingId: string) => void;
	replaceWorkspaceData: (snapshot: WorkspaceSnapshot) => void;
	getExportData: () => WorkspaceSnapshot;
};

const now = () => Date.now();
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const defaultSprint: WorkspaceSprint = {
	name: "Sprint 12",
	goal: "Ship workspace MVP for startup teams",
	endDate: "",
};

const defaultWipLimits: Record<TaskStatus, number> = {
	backlog: 50,
	in_progress: 4,
	review: 3,
	done: 999,
};

const newActivity = (
	type: WorkspaceActivity["type"],
	message: string
): WorkspaceActivity => ({
	id: makeId(),
	type,
	message,
	at: now(),
});

const pushActivity = (
	activityLog: WorkspaceActivity[],
	activity: WorkspaceActivity
) => [activity, ...activityLog].slice(0, 80);

const makeBoardPrefix = (name: string) => {
	const letters = name
		.toUpperCase()
		.replace(/[^A-Z\s]/g, "")
		.split(/\s+/)
		.filter(Boolean)
		.map((token) => token[0])
		.join("");

	return (letters || "PRJ").slice(0, 4);
};

const nextJiraKey = (board: WorkspaceBoard) => {
	const prefix = makeBoardPrefix(board.name);
	let max = 0;

	Object.values(board.cards).forEach((card) => {
		const match = card.jiraKey.match(/-(\d+)$/);
		if (!match) return;
		const value = Number(match[1]);
		if (value > max) max = value;
	});

	return `${prefix}-${max + 1}`;
};

const cloneBoardEntity = (board: WorkspaceBoard, name?: string): WorkspaceBoard => {
	const nowAt = now();
	const listIdMap: Record<string, string> = {};
	const cardIdMap: Record<string, string> = {};

	const lists: Record<string, BoardList> = {};
	const cards: Record<string, BoardCard> = {};

	board.listOrder.forEach((oldListId) => {
		const newListId = makeId();
		listIdMap[oldListId] = newListId;
	});

	Object.values(board.cards).forEach((card) => {
		cardIdMap[card.id] = makeId();
	});

	board.listOrder.forEach((oldListId) => {
		const list = board.lists[oldListId];
		const newListId = listIdMap[oldListId];

		lists[newListId] = {
			...list,
			id: newListId,
			cardIds: list.cardIds
				.map((cardId) => cardIdMap[cardId])
				.filter(Boolean),
		};
	});

	Object.values(board.cards).forEach((card) => {
		const newCardId = cardIdMap[card.id];
		cards[newCardId] = {
			...card,
			id: newCardId,
			jiraKey: "",
			checklist: card.checklist.map((item) => ({
				...item,
				id: makeId(),
			})),
			updatedAt: nowAt,
		};
	});

	const cloned: WorkspaceBoard = {
		...board,
		id: makeId(),
		name: name || `${board.name} Copy`,
		listOrder: board.listOrder.map((listId) => listIdMap[listId]),
		lists,
		cards,
		updatedAt: nowAt,
	};

	Object.values(cloned.cards).forEach((card) => {
		card.jiraKey = nextJiraKey(cloned);
	});

	return cloned;
};

const defaultChannels: WorkspaceChannel[] = [
	{
		id: "general",
		name: "general",
		description: "Team-wide updates",
		memberCount: 8,
		lastMessageAt: now(),
	},
	{
		id: "product",
		name: "product",
		description: "Roadmap and sprint planning",
		memberCount: 5,
		lastMessageAt: now(),
	},
	{
		id: "engineering",
		name: "engineering",
		description: "Build, incidents, and releases",
		memberCount: 6,
		lastMessageAt: now(),
	},
];

const defaultTasks: WorkspaceTask[] = [
	{
		id: makeId(),
		title: "Set up onboarding flow",
		description: "Define steps and owner for week-1 user onboarding.",
		status: "backlog",
		assignee: "Aman",
		priority: "high",
		tags: ["growth", "product"],
		createdAt: now(),
	},
	{
		id: makeId(),
		title: "Launch workspace analytics",
		description: "Track active teams and daily message volume.",
		status: "in_progress",
		assignee: "Riya",
		priority: "medium",
		tags: ["analytics"],
		createdAt: now(),
	},
	{
		id: makeId(),
		title: "Finalize investor update deck",
		description: "Review metrics and narrative before Friday.",
		status: "review",
		assignee: "Sam",
		priority: "high",
		tags: ["ops"],
		createdAt: now(),
	},
	{
		id: makeId(),
		title: "Improve notification reliability",
		description: "Stabilize retry logic and reduce duplicate sends.",
		status: "done",
		assignee: "Nina",
		priority: "medium",
		tags: ["backend"],
		createdAt: now(),
	},
];

const defaultBoardLabels: BoardLabel[] = [
	{ id: makeId(), name: "Product", color: "indigo" },
	{ id: makeId(), name: "Backend", color: "emerald" },
	{ id: makeId(), name: "Urgent", color: "red" },
	{ id: makeId(), name: "Design", color: "sky" },
];

const createDefaultBoard = (): WorkspaceBoard => {
	const backlogListId = makeId();
	const inProgressListId = makeId();
	const reviewListId = makeId();
	const doneListId = makeId();

	const labels = defaultBoardLabels;
	const cards: Record<string, BoardCard> = {};

	const mapStatusToListId: Record<TaskStatus, string> = {
		backlog: backlogListId,
		in_progress: inProgressListId,
		review: reviewListId,
		done: doneListId,
	};

	const lists: Record<string, BoardList> = {
		[backlogListId]: {
			id: backlogListId,
			title: "Backlog",
			cardIds: [],
			archived: false,
			createdAt: now(),
		},
		[inProgressListId]: {
			id: inProgressListId,
			title: "In Progress",
			cardIds: [],
			archived: false,
			createdAt: now(),
		},
		[reviewListId]: {
			id: reviewListId,
			title: "Review",
			cardIds: [],
			archived: false,
			createdAt: now(),
		},
		[doneListId]: {
			id: doneListId,
			title: "Done",
			cardIds: [],
			archived: false,
			createdAt: now(),
		},
	};

	defaultTasks.forEach((task) => {
		const cardId = makeId();
		const matchedLabel =
			task.tags.length > 0
				? labels.find((label) =>
						label.name.toLowerCase() === task.tags[0].toLowerCase()
			  )
				: undefined;

		cards[cardId] = {
			id: cardId,
			title: task.title,
			description: task.description,
			jiraKey: "",
			issueType: task.priority === "high" ? "story" : "task",
			storyPoints: task.priority === "high" ? 8 : 3,
			epic: task.tags[0],
			sprintName: defaultSprint.name,
			reporter: "Founder",
			dueDate: task.dueDate,
			members: task.assignee && task.assignee !== "Unassigned" ? [task.assignee] : [],
			labels: matchedLabel ? [matchedLabel.id] : [],
			checklist: [],
			coverColor:
				task.priority === "high"
					? "#dc2626"
					: task.priority === "medium"
						? "#d97706"
						: "#0284c7",
			archived: false,
			createdAt: task.createdAt,
			updatedAt: now(),
		};

		lists[mapStatusToListId[task.status]].cardIds.push(cardId);
	});

	const board: WorkspaceBoard = {
		id: makeId(),
		name: "Product Delivery Board",
		listOrder: [backlogListId, inProgressListId, reviewListId, doneListId],
		lists,
		cards,
		labels,
		createdAt: now(),
		updatedAt: now(),
	};

	Object.values(board.cards).forEach((card) => {
		card.jiraKey = nextJiraKey(board);
	});

	return board;
};

const defaultMeetings: WorkspaceMeeting[] = [
	{
		id: makeId(),
		title: "Weekly Product Sync",
		date: "",
		owner: "Aman",
		agenda: "Review roadmap progress, blockers, and sprint scope decisions.",
		actionItems: "Finalize Q2 priorities. Share customer interview summary.",
		status: "planned",
		createdAt: now(),
	},
];

const defaultSlackUpdates: SlackUpdate[] = [
	{
		id: makeId(),
		channel: "general",
		message: "Daily standup thread opened. Share yesterday/today/blockers.",
		author: "Aman",
		createdAt: now(),
	},
	{
		id: makeId(),
		channel: "product",
		message: "Sprint scope locked. Jira stories moved to In Progress.",
		author: "Riya",
		createdAt: now(),
	},
];

const initialSnapshot: WorkspaceSnapshot = {
	workspaceName: "Pulse Startup Workspace",
	workflowTemplate: "hybrid",
	boards: [createDefaultBoard()],
	selectedBoardId: "",
	slackUpdates: defaultSlackUpdates,
	channels: defaultChannels,
	selectedChannelId: "general",
	channelNotes: {
		general: "Daily async standup and announcements.",
		product: "Current sprint objective: improve team activation.",
		engineering: "Release train every Thursday 6 PM.",
	},
	tasks: defaultTasks,
	meetings: defaultMeetings,
	sprint: defaultSprint,
	wipLimits: defaultWipLimits,
	activityLog: [newActivity("sprint", "Workspace initialized")],
	lastUpdated: now(),
};

initialSnapshot.selectedBoardId = initialSnapshot.boards[0]?.id || "";

const updateBoardCollection = (
	boards: WorkspaceBoard[],
	boardId: string,
	updater: (board: WorkspaceBoard) => WorkspaceBoard
) => {
	let changed = false;
	const next = boards.map((board) => {
		if (board.id !== boardId) return board;
		changed = true;
		return updater(board);
	});
	return { changed, next };
};

export const useWorkspaceStore = create<WorkspaceState>()(
	persist(
		(set, get) => ({
			...initialSnapshot,

			setWorkspaceName: (name) =>
				set((state) => ({
					workspaceName: name,
					activityLog: pushActivity(
						state.activityLog,
						newActivity("sprint", `Workspace renamed to ${name || "Untitled Workspace"}`)
					),
					lastUpdated: now(),
				})),

			setWorkflowTemplate: (template) =>
				set((state) => ({
					workflowTemplate: template,
					activityLog: pushActivity(
						state.activityLog,
						newActivity("sprint", `Workflow switched to ${template}`)
					),
					lastUpdated: now(),
				})),

			addBoard: (name) =>
				set((state) => {
					const title = name.trim();
					if (!title) return state;

					const todoListId = makeId();
					const doingListId = makeId();
					const doneListId = makeId();
					const board: WorkspaceBoard = {
						id: makeId(),
						name: title,
						listOrder: [todoListId, doingListId, doneListId],
						lists: {
							[todoListId]: {
								id: todoListId,
								title: "To Do",
								cardIds: [],
								archived: false,
								createdAt: now(),
							},
							[doingListId]: {
								id: doingListId,
								title: "Doing",
								cardIds: [],
								archived: false,
								createdAt: now(),
							},
							[doneListId]: {
								id: doneListId,
								title: "Done",
								cardIds: [],
								archived: false,
								createdAt: now(),
							},
						},
						cards: {},
						labels: [
							{ id: makeId(), name: "Feature", color: "indigo" },
							{ id: makeId(), name: "Bug", color: "red" },
						],
						createdAt: now(),
						updatedAt: now(),
					};

					return {
						boards: [board, ...state.boards],
						selectedBoardId: board.id,
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Board created: ${title}`)
						),
						lastUpdated: now(),
					};
				}),

			cloneBoard: (boardId) =>
				set((state) => {
					const source = state.boards.find((board) => board.id === boardId);
					if (!source) return state;

					const cloned = cloneBoardEntity(source);

					return {
						boards: [cloned, ...state.boards],
						selectedBoardId: cloned.id,
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Board cloned: ${source.name}`)
						),
						lastUpdated: now(),
					};
				}),

			selectBoard: (boardId) =>
				set((state) => ({
					selectedBoardId: state.boards.some((board) => board.id === boardId)
						? boardId
						: state.selectedBoardId,
				})),

			renameBoard: (boardId, name) =>
				set((state) => {
					const title = name.trim();
					if (!title) return state;

					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => ({ ...board, name: title, updatedAt: now() })
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			deleteBoard: (boardId) =>
				set((state) => {
					if (state.boards.length <= 1) return state;
					const removed = state.boards.find((board) => board.id === boardId);
					if (!removed) return state;

					const boards = state.boards.filter((board) => board.id !== boardId);
					return {
						boards,
						selectedBoardId:
							state.selectedBoardId === boardId
								? boards[0]?.id || ""
								: state.selectedBoardId,
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Board removed: ${removed.name}`)
						),
						lastUpdated: now(),
					};
				}),

			addBoardList: (boardId, title) =>
				set((state) => {
					const trimmed = title.trim();
					if (!trimmed) return state;

					const listId = makeId();
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => ({
							...board,
							listOrder: [...board.listOrder, listId],
							lists: {
								...board.lists,
								[listId]: {
									id: listId,
									title: trimmed,
									cardIds: [],
									archived: false,
									createdAt: now(),
								},
							},
							updatedAt: now(),
						})
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			renameBoardList: (boardId, listId, title) =>
				set((state) => {
					const trimmed = title.trim();
					if (!trimmed) return state;

					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							if (!board.lists[listId]) return board;
							return {
								...board,
								lists: {
									...board.lists,
									[listId]: {
										...board.lists[listId],
										title: trimmed,
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			deleteBoardList: (boardId, listId) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							if (!board.lists[listId]) return board;

							const cards = { ...board.cards };
							board.lists[listId].cardIds.forEach((cardId) => {
								delete cards[cardId];
							});

							const lists = { ...board.lists };
							delete lists[listId];

							return {
								...board,
								lists,
								cards,
								listOrder: board.listOrder.filter((id) => id !== listId),
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			addBoardCard: (boardId, listId, input) =>
				set((state) => {
					const title = input.title.trim();
					if (!title) return state;

					const cardId = makeId();
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const list = board.lists[listId];
							if (!list) return board;

							const card: BoardCard = {
								id: cardId,
								title,
								description: (input.description || "").trim(),
								jiraKey: nextJiraKey(board),
								issueType: input.issueType || "task",
								storyPoints: input.storyPoints,
								epic: input.epic,
								sprintName: input.sprintName,
								reporter: input.reporter,
								dueDate: input.dueDate,
								members: input.members || [],
								labels: input.labels || [],
								checklist: [],
								coverColor: input.coverColor,
								archived: false,
								createdAt: now(),
								updatedAt: now(),
							};

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: card,
								},
								lists: {
									...board.lists,
									[listId]: {
										...list,
										cardIds: [...list.cardIds, cardId],
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Card created: ${title}`)
						),
						lastUpdated: now(),
					};
				}),

			moveBoardCard: (boardId, cardId, fromListId, toListId, toIndex) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const fromList = board.lists[fromListId];
							const toList = board.lists[toListId];
							if (!fromList || !toList) return board;

							if (!fromList.cardIds.includes(cardId)) return board;

							const fromCards = fromList.cardIds.filter((id) => id !== cardId);
							const targetCards =
								fromListId === toListId ? fromCards : [...toList.cardIds];
							const insertAt =
								typeof toIndex === "number"
									? Math.max(0, Math.min(toIndex, targetCards.length))
									: targetCards.length;
							targetCards.splice(insertAt, 0, cardId);

							return {
								...board,
								lists: {
									...board.lists,
									[fromListId]: {
										...fromList,
										cardIds: fromListId === toListId ? targetCards : fromCards,
									},
									[toListId]: {
										...toList,
										cardIds: targetCards,
									},
								},
								cards: {
									...board.cards,
									[cardId]: {
										...board.cards[cardId],
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			updateBoardCard: (boardId, cardId, payload) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const card = board.cards[cardId];
							if (!card) return board;

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: {
										...card,
										...payload,
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			deleteBoardCard: (boardId, cardId, fromListId) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							if (!board.cards[cardId] || !board.lists[fromListId]) return board;

							const cards = { ...board.cards };
							delete cards[cardId];

							return {
								...board,
								cards,
								lists: {
									...board.lists,
									[fromListId]: {
										...board.lists[fromListId],
										cardIds: board.lists[fromListId].cardIds.filter((id) => id !== cardId),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			addBoardLabel: (boardId, name, color) =>
				set((state) => {
					const title = name.trim();
					if (!title) return state;

					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => ({
							...board,
							labels: [
								{ id: makeId(), name: title, color },
								...board.labels,
							],
							updatedAt: now(),
						})
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			toggleCardLabel: (boardId, cardId, labelId) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const card = board.cards[cardId];
							if (!card) return board;

							const labels = card.labels.includes(labelId)
								? card.labels.filter((id) => id !== labelId)
								: [...card.labels, labelId];

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: {
										...card,
										labels,
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			addCardChecklistItem: (boardId, cardId, text) =>
				set((state) => {
					const itemText = text.trim();
					if (!itemText) return state;

					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const card = board.cards[cardId];
							if (!card) return board;

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: {
										...card,
										checklist: [
											...card.checklist,
											{
												id: makeId(),
												text: itemText,
												done: false,
												createdAt: now(),
											},
										],
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			toggleCardChecklistItem: (boardId, cardId, itemId) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const card = board.cards[cardId];
							if (!card) return board;

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: {
										...card,
										checklist: card.checklist.map((item) =>
											item.id === itemId ? { ...item, done: !item.done } : item
										),
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			removeCardChecklistItem: (boardId, cardId, itemId) =>
				set((state) => {
					const { changed, next } = updateBoardCollection(
						state.boards,
						boardId,
						(board) => {
							const card = board.cards[cardId];
							if (!card) return board;

							return {
								...board,
								cards: {
									...board.cards,
									[cardId]: {
										...card,
										checklist: card.checklist.filter((item) => item.id !== itemId),
										updatedAt: now(),
									},
								},
								updatedAt: now(),
							};
						}
					);

					if (!changed) return state;

					return {
						boards: next,
						lastUpdated: now(),
					};
				}),

			addSlackUpdate: (channel, message, author = "You") =>
				set((state) => {
					const text = message.trim();
					const safeChannel = channel.trim() || "general";
					if (!text) return state;

					const entry: SlackUpdate = {
						id: makeId(),
						channel: safeChannel,
						message: text,
						author: author.trim() || "You",
						createdAt: now(),
					};

					return {
						slackUpdates: [entry, ...state.slackUpdates].slice(0, 60),
						activityLog: pushActivity(
							state.activityLog,
							newActivity("channel", `Slack update posted in #${safeChannel}`)
						),
						lastUpdated: now(),
					};
				}),

			deleteSlackUpdate: (updateId) =>
				set((state) => ({
					slackUpdates: state.slackUpdates.filter((item) => item.id !== updateId),
					lastUpdated: now(),
				})),

			addChannel: (name, description = "") =>
				set((state) => {
					const trimmed = name.trim();
					if (!trimmed) return state;

					const id = trimmed.toLowerCase().replace(/\s+/g, "-") + `-${Math.random().toString(36).slice(2, 5)}`;
					const channel: WorkspaceChannel = {
						id,
						name: trimmed,
						description: description.trim(),
						memberCount: 1,
						lastMessageAt: now(),
					};

					return {
						channels: [channel, ...state.channels],
						selectedChannelId: channel.id,
						channelNotes: {
							...state.channelNotes,
							[channel.id]: "",
						},
						activityLog: pushActivity(
							state.activityLog,
							newActivity("channel", `Channel #${channel.name} created`)
						),
						lastUpdated: now(),
					};
				}),

			selectChannel: (channelId) => set({ selectedChannelId: channelId }),

			setChannelNote: (channelId, note) =>
				set((state) => ({
					channelNotes: {
						...state.channelNotes,
						[channelId]: note,
					},
					lastUpdated: now(),
				})),

			setSprintPlan: (payload) =>
				set((state) => ({
					sprint: {
						name: payload.name,
						goal: payload.goal,
						endDate: payload.endDate,
					},
					activityLog: pushActivity(
						state.activityLog,
						newActivity("sprint", `Sprint updated: ${payload.name || "Untitled Sprint"}`)
					),
					lastUpdated: now(),
				})),

			setWipLimit: (status, limit) =>
				set((state) => ({
					wipLimits: {
						...state.wipLimits,
						[status]: Math.max(1, limit),
					},
					lastUpdated: now(),
				})),

			addTask: (task) =>
				set((state) => {
					const title = task.title.trim();
					if (!title) return state;

					const newTask: WorkspaceTask = {
						id: makeId(),
						title,
						description: (task.description || "").trim(),
						status: "backlog",
						assignee: (task.assignee || "Unassigned").trim() || "Unassigned",
						priority: task.priority || "medium",
						dueDate: task.dueDate,
						tags: task.tags || [],
						createdAt: now(),
					};

					return {
						tasks: [newTask, ...state.tasks],
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Task created: ${newTask.title}`)
						),
						lastUpdated: now(),
					};
				}),

			setTaskStatus: (taskId, status) =>
				set((state) => {
					const movedTask = state.tasks.find((task) => task.id === taskId);
					return {
						tasks: state.tasks.map((task) =>
							task.id === taskId ? { ...task, status } : task
						),
						activityLog: movedTask
							? pushActivity(
									state.activityLog,
									newActivity("task", `Task moved to ${status}: ${movedTask.title}`)
							  )
							: state.activityLog,
						lastUpdated: now(),
					};
				}),

			duplicateTask: (taskId) =>
				set((state) => {
					const task = state.tasks.find((item) => item.id === taskId);
					if (!task) return state;

					const duplicate: WorkspaceTask = {
						...task,
						id: makeId(),
						title: `${task.title} (Copy)`,
						status: "backlog",
						createdAt: now(),
					};

					return {
						tasks: [duplicate, ...state.tasks],
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `Task duplicated: ${task.title}`)
						),
						lastUpdated: now(),
					};
				}),

			deleteTask: (taskId) =>
				set((state) => {
					const removed = state.tasks.find((task) => task.id === taskId);
					return {
						tasks: state.tasks.filter((task) => task.id !== taskId),
						activityLog: removed
							? pushActivity(
									state.activityLog,
									newActivity("task", `Task deleted: ${removed.title}`)
							  )
							: state.activityLog,
						lastUpdated: now(),
					};
				}),

			archiveDoneTasks: () =>
				set((state) => {
					const doneCount = state.tasks.filter((task) => task.status === "done").length;
					if (doneCount === 0) return state;

					return {
						tasks: state.tasks.filter((task) => task.status !== "done"),
						activityLog: pushActivity(
							state.activityLog,
							newActivity("task", `${doneCount} completed tasks archived`)
						),
						lastUpdated: now(),
					};
				}),

			addMeeting: (meeting) =>
				set((state) => {
					const title = meeting.title.trim();
					if (!title) return state;

					const entry: WorkspaceMeeting = {
						id: makeId(),
						title,
						date: meeting.date,
						owner: meeting.owner.trim() || "Unassigned",
						agenda: meeting.agenda.trim(),
						actionItems: meeting.actionItems.trim(),
						status: meeting.status,
						createdAt: now(),
					};

					return {
						meetings: [entry, ...state.meetings],
						activityLog: pushActivity(
							state.activityLog,
							newActivity("sprint", `Meeting created: ${entry.title}`)
						),
						lastUpdated: now(),
					};
				}),

			setMeetingStatus: (meetingId, status) =>
				set((state) => {
					const meeting = state.meetings.find((item) => item.id === meetingId);
					if (!meeting) return state;

					return {
						meetings: state.meetings.map((item) =>
							item.id === meetingId ? { ...item, status } : item
						),
						activityLog: pushActivity(
							state.activityLog,
							newActivity("sprint", `Meeting marked ${status}: ${meeting.title}`)
						),
						lastUpdated: now(),
					};
				}),

			updateMeetingNotes: (meetingId, payload) =>
				set((state) => ({
					meetings: state.meetings.map((item) =>
						item.id === meetingId
							? {
								...item,
								agenda: payload.agenda ?? item.agenda,
								actionItems: payload.actionItems ?? item.actionItems,
							}
							: item
					),
					lastUpdated: now(),
				})),

			deleteMeeting: (meetingId) =>
				set((state) => {
					const removed = state.meetings.find((item) => item.id === meetingId);
					return {
						meetings: state.meetings.filter((item) => item.id !== meetingId),
						activityLog: removed
							? pushActivity(
									state.activityLog,
									newActivity("sprint", `Meeting removed: ${removed.title}`)
							  )
							: state.activityLog,
						lastUpdated: now(),
					};
				}),

			replaceWorkspaceData: (snapshot) =>
				set((state) => {
					const incoming = snapshot as Partial<WorkspaceSnapshot>;
					const boards = incoming.boards || state.boards;
					return {
						workspaceName: incoming.workspaceName || state.workspaceName,
						workflowTemplate: incoming.workflowTemplate || state.workflowTemplate,
						boards,
						selectedBoardId:
							incoming.selectedBoardId ||
							state.selectedBoardId ||
							boards[0]?.id ||
							"",
						slackUpdates: incoming.slackUpdates || state.slackUpdates,
						channels: incoming.channels || state.channels,
						selectedChannelId: incoming.selectedChannelId || state.selectedChannelId,
						channelNotes: incoming.channelNotes || state.channelNotes,
						tasks: incoming.tasks || state.tasks,
						meetings: incoming.meetings || state.meetings,
						sprint: incoming.sprint || state.sprint,
						wipLimits: incoming.wipLimits || state.wipLimits,
						activityLog: pushActivity(
							incoming.activityLog || state.activityLog,
							newActivity("security", "Encrypted backup imported")
						),
						lastUpdated: now(),
					};
				}),

			getExportData: () => {
				const state = get();
				return {
					workspaceName: state.workspaceName,
					workflowTemplate: state.workflowTemplate,
					boards: state.boards,
					selectedBoardId: state.selectedBoardId,
					slackUpdates: state.slackUpdates,
					channels: state.channels,
					selectedChannelId: state.selectedChannelId,
					channelNotes: state.channelNotes,
					tasks: state.tasks,
					meetings: state.meetings,
					sprint: state.sprint,
					wipLimits: state.wipLimits,
					activityLog: state.activityLog,
					lastUpdated: state.lastUpdated,
				};
			},
		}),
		{
			name: "pulse-workspace-storage",
			partialize: (state) => ({
				workspaceName: state.workspaceName,
				workflowTemplate: state.workflowTemplate,
				boards: state.boards,
				selectedBoardId: state.selectedBoardId,
				slackUpdates: state.slackUpdates,
				channels: state.channels,
				selectedChannelId: state.selectedChannelId,
				channelNotes: state.channelNotes,
				tasks: state.tasks,
				meetings: state.meetings,
				sprint: state.sprint,
				wipLimits: state.wipLimits,
				activityLog: state.activityLog,
				lastUpdated: state.lastUpdated,
			}),
		}
	)
);

