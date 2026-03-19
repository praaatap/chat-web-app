import { BoardCard, BoardLabelColor } from "../../../store/useWorkspaceStore";
import { WorkspaceShellState } from "../useWorkspaceShellState";
import { CARD_COVER_CHOICES, LABEL_BADGE_STYLE, LABEL_CHOICES } from "../workspaceViewConfig";

export function CardDetailsPanel({ state }: { state: WorkspaceShellState }) {
  if (!state.selectedBoard || !state.activeCardData || !state.activeCard) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Card Details</p>
        <p className="mt-3 rounded-xl border border-dashed border-zinc-200 px-3 py-5 text-center text-xs text-zinc-400">
          Select a card to edit title, members, labels, due date, and checklist.
        </p>
      </div>
    );
  }

  const selectedBoard = state.selectedBoard;
  const activeCardData = state.activeCardData;
  const activeCard = state.activeCard;

  const updateCard = (payload: Partial<Omit<BoardCard, "id" | "createdAt">>) => {
    state.store.updateBoardCard(selectedBoard.id, activeCardData.id, payload);
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Card Details</p>
      <div className="mt-3 space-y-3">
        <input value={activeCardData.title} onChange={(e) => updateCard({ title: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500" />
        <textarea value={activeCardData.description} onChange={(e) => updateCard({ description: e.target.value })} rows={3} placeholder="Description" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        <input value={activeCardData.jiraKey} onChange={(e) => updateCard({ jiraKey: e.target.value.toUpperCase() })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-black tracking-wide outline-none focus:border-indigo-500" />

        <div className="grid grid-cols-2 gap-2">
          <select value={activeCardData.issueType} onChange={(e) => updateCard({ issueType: e.target.value as BoardCard["issueType"] })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500">
            <option value="story">Story</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="epic">Epic</option>
          </select>
          <input type="number" value={activeCardData.storyPoints ?? ""} onChange={(e) => updateCard({ storyPoints: e.target.value ? Number(e.target.value) : undefined })} placeholder="Story points" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input value={activeCardData.epic || ""} onChange={(e) => updateCard({ epic: e.target.value || undefined })} placeholder="Epic" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          <input value={activeCardData.sprintName || ""} onChange={(e) => updateCard({ sprintName: e.target.value || undefined })} placeholder="Sprint" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>

        <input value={activeCardData.reporter || ""} onChange={(e) => updateCard({ reporter: e.target.value || undefined })} placeholder="Reporter" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        <input type="date" value={activeCardData.dueDate || ""} onChange={(e) => updateCard({ dueDate: e.target.value || undefined })} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        <input value={activeCardData.members.join(", ")} onChange={(e) => updateCard({ members: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="Members (comma separated)" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" />

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">Cover</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CARD_COVER_CHOICES.map((color) => (
              <button key={color} onClick={() => updateCard({ coverColor: color })} className="h-6 w-6 rounded-full border border-zinc-200" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">Labels</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {state.selectedBoard.labels.map((label) => (
              <button
                key={label.id}
                onClick={() => state.store.toggleCardLabel(selectedBoard.id, activeCardData.id, label.id)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${LABEL_BADGE_STYLE[label.color]} ${
                  activeCardData.labels.includes(label.id) ? "ring-2 ring-zinc-900" : "opacity-80"
                }`}
              >
                {label.name}
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
            <input value={state.newLabelName} onChange={(e) => state.setNewLabelName(e.target.value)} placeholder="New label" className="rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-indigo-500" />
            <select value={state.newLabelColor} onChange={(e) => state.setNewLabelColor(e.target.value as BoardLabelColor)} className="rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-indigo-500">
              {LABEL_CHOICES.map((choice) => (
                <option key={choice} value={choice}>{choice}</option>
              ))}
            </select>
            <button onClick={() => { state.store.addBoardLabel(selectedBoard.id, state.newLabelName, state.newLabelColor); state.setNewLabelName(""); }} className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-bold text-white">Add</button>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">Checklist</p>
          <div className="mt-2 space-y-2">
            {activeCardData.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input type="checkbox" checked={item.done} onChange={() => state.store.toggleCardChecklistItem(selectedBoard.id, activeCardData.id, item.id)} />
                <p className={`flex-1 text-xs ${item.done ? "text-zinc-400 line-through" : "text-zinc-700"}`}>{item.text}</p>
                <button onClick={() => state.store.removeCardChecklistItem(selectedBoard.id, activeCardData.id, item.id)} className="text-[10px] font-bold text-zinc-400 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={state.checklistDraft} onChange={(e) => state.setChecklistDraft(e.target.value)} placeholder="Checklist item" className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-indigo-500" />
            <button onClick={() => { state.store.addCardChecklistItem(selectedBoard.id, activeCardData.id, state.checklistDraft); state.setChecklistDraft(""); }} className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-bold text-white">Add</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => updateCard({ archived: !activeCardData.archived })} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700">
            {activeCardData.archived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={() => {
              state.store.deleteBoardCard(selectedBoard.id, activeCardData.id, activeCard.listId);
              state.setActiveCard(null);
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
          >
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}
