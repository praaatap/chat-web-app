import { WorkspaceShellState } from "../useWorkspaceShellState";
import { ISSUE_FILTER_OPTIONS } from "../workspaceViewConfig";

export function BoardSearchControls({ state }: { state: WorkspaceShellState }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <input
          value={state.searchQuery}
          onChange={(e) => state.setSearchQuery(e.target.value)}
          placeholder="Search cards"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />

        {state.routeMode === "delivery" && (
          <select
            value={state.jiraIssueFilter}
            onChange={(e) => state.setJiraIssueFilter(e.target.value as typeof state.jiraIssueFilter)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            {ISSUE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <input
          value={state.newListTitle}
          onChange={(e) => state.setNewListTitle(e.target.value)}
          placeholder="New list title"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          onClick={state.handleAddList}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Add List
        </button>
      </div>
    </div>
  );
}
