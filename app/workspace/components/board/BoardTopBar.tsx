import { WorkspaceShellState } from "../useWorkspaceShellState";

export function BoardTopBar({ state }: { state: WorkspaceShellState }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
        <select
          value={state.selectedBoard?.id || ""}
          onChange={(e) => state.store.selectBoard(e.target.value)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500"
        >
          {state.store.boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>

        {state.selectedBoard && (
          <input
            value={state.selectedBoard.name}
            onChange={(e) => state.store.renameBoard(state.selectedBoard.id, e.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        )}

        <button
          disabled={!state.selectedBoard}
          onClick={() => state.selectedBoard && state.store.cloneBoard(state.selectedBoard.id)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 disabled:opacity-40"
        >
          Clone Board
        </button>

        <button
          disabled={!state.selectedBoard || state.store.boards.length <= 1}
          onClick={() => state.selectedBoard && state.store.deleteBoard(state.selectedBoard.id)}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-40"
        >
          Delete Board
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={state.newBoardName}
          onChange={(e) => state.setNewBoardName(e.target.value)}
          placeholder="Create new board"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          onClick={state.handleAddBoard}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
        >
          Add Board
        </button>
      </div>
    </div>
  );
}
