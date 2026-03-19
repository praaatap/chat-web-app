import { WorkspaceShellState } from "./useWorkspaceShellState";
import { WorkspaceMetricCard } from "./WorkspaceMetricCard";
import { ROUTE_DESCRIPTIONS, ROUTE_LABELS, WORKFLOW_LABELS } from "./workspaceViewConfig";

export function WorkspaceHeader({ state }: { state: WorkspaceShellState }) {
  const routeLabel = ROUTE_LABELS[state.routeMode];
  const routeDescription = ROUTE_DESCRIPTIONS[state.routeMode];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Private Team Hub</p>
          <p className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">
            Route: {routeLabel}
          </p>
          <input
            value={state.store.workspaceName}
            onChange={(e) => state.store.setWorkspaceName(e.target.value)}
            className="mt-2 w-full max-w-xl rounded-xl border border-zinc-200 px-4 py-2 text-2xl font-black tracking-tight outline-none focus:border-indigo-500"
          />
          <p className="mt-2 text-sm text-zinc-500">{routeDescription}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <WorkspaceMetricCard label="Channels" value={state.summary.channels} />
          <WorkspaceMetricCard label="Cards" value={state.summary.cards} />
          <WorkspaceMetricCard label="Due Soon" value={state.summary.dueSoon} />
          <WorkspaceMetricCard label="Quality Alerts" value={state.summary.bugs} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Operating Model</p>
          <p className="mt-1 text-sm text-zinc-600">
            Tune collaboration style for messaging-led, delivery-led, or balanced operations.
          </p>
        </div>
        <select
          value={state.store.workflowTemplate}
          onChange={(e) => state.store.setWorkflowTemplate(e.target.value as typeof state.store.workflowTemplate)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 outline-none focus:border-indigo-500"
        >
          {Object.entries(WORKFLOW_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
