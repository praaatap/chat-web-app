import { WorkspaceShellState } from "../useWorkspaceShellState";
import { LABEL_BADGE_STYLE } from "../workspaceViewConfig";

export function BoardColumns({ state }: { state: WorkspaceShellState }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex min-h-96 gap-4">
        {state.selectedBoard &&
          state.boardLists.map((list) => (
            <section
              key={list.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => state.handleCardDrop(e, list.id)}
              className="w-80 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <input
                  value={list.title}
                  onChange={(e) => state.store.renameBoardList(state.selectedBoard.id, list.id, e.target.value)}
                  className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-black text-zinc-800 outline-none focus:border-zinc-300 focus:bg-white"
                />
                <button
                  onClick={() => state.store.deleteBoardList(state.selectedBoard.id, list.id)}
                  className="text-xs font-bold text-zinc-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3">
                {(state.visibleCardsByList[list.id] || []).map((card) => {
                  const doneItems = card.checklist.filter((item) => item.done).length;
                  const totalItems = card.checklist.length;

                  return (
                    <article
                      key={card.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/x-card",
                          JSON.stringify({ cardId: card.id, fromListId: list.id })
                        )
                      }
                      onClick={() => state.setActiveCard({ listId: list.id, cardId: card.id })}
                      className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                    >
                      {card.coverColor && (
                        <div className="mb-2 h-2 rounded-full" style={{ backgroundColor: card.coverColor }} />
                      )}
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-black text-zinc-700">
                          {card.jiraKey}
                        </span>
                        <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                          {card.issueType}
                        </span>
                        {typeof card.storyPoints === "number" && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            {card.storyPoints} SP
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-zinc-900">{card.title}</p>
                      {card.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{card.description}</p>}

                      <div className="mt-2 flex flex-wrap gap-1">
                        {card.labels.map((labelId) => {
                          const label = state.selectedBoard.labels.find((item) => item.id === labelId);
                          if (!label) return null;
                          return (
                            <span
                              key={label.id}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${LABEL_BADGE_STYLE[label.color]}`}
                            >
                              {label.name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-semibold text-zinc-500">
                        <span>{card.dueDate ? `Due ${card.dueDate}` : "No due date"}</span>
                        <span>{totalItems > 0 ? `${doneItems}/${totalItems} checklist` : "No checklist"}</span>
                      </div>
                    </article>
                  );
                })}

                {(state.visibleCardsByList[list.id] || []).length === 0 && (
                  <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400">
                    No cards in this list.
                  </p>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <input
                  value={state.newCardTitleByList[list.id] || ""}
                  onChange={(e) => state.setNewCardTitleByList((prev) => ({ ...prev, [list.id]: e.target.value }))}
                  placeholder="Add a card"
                  className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => state.handleAddCard(list.id)}
                  className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Add Card
                </button>
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
