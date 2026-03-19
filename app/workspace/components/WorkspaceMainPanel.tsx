import { WorkspaceShellState } from "./useWorkspaceShellState";
import { ROUTE_DESCRIPTIONS, ROUTE_LABELS } from "./workspaceViewConfig";
import { BoardWorkspaceView } from "./board/BoardWorkspaceView";
import { RitualsWorkspaceView } from "./rituals/RitualsWorkspaceView";

export function WorkspaceMainPanel({ state }: { state: WorkspaceShellState }) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Route Board</p>
            <p className="mt-1 text-xs text-zinc-500">{ROUTE_DESCRIPTIONS[state.routeMode]}</p>
          </div>
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700">
            Active: {ROUTE_LABELS[state.routeMode]}
          </p>
        </div>
      </div>

      {state.activeMainView === "kanban" ? (
        <BoardWorkspaceView state={state} />
      ) : (
        <RitualsWorkspaceView state={state} />
      )}
    </section>
  );
}
