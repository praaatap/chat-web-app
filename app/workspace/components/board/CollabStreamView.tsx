import { WorkspaceShellState } from "../useWorkspaceShellState";

export function CollabStreamView({ state }: { state: WorkspaceShellState }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Team Signal Stream</p>
      <p className="mt-1 text-xs text-zinc-500">
        Dedicated route for communication history, leadership updates, and execution transparency.
      </p>
      <div className="mt-4 space-y-3">
        {state.store.slackUpdates.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black text-zinc-700">#{item.channel} · {item.author}</p>
              <p className="text-[10px] text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-2 text-sm text-zinc-700">{item.message}</p>
          </article>
        ))}
        {state.store.slackUpdates.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-5 text-center text-xs text-zinc-400">
            No team signals posted yet.
          </p>
        )}
      </div>
    </div>
  );
}
