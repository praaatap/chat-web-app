import { WorkspaceShellState } from "./useWorkspaceShellState";
import { WORKFLOW_LABELS } from "./workspaceViewConfig";

export function WorkspaceSidebar({ state }: { state: WorkspaceShellState }) {
  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Team Channels</p>
        <p className="mt-1 text-xs text-zinc-500">Mode: {WORKFLOW_LABELS[state.store.workflowTemplate]}</p>
        <div className="mt-3 space-y-2">
          {state.store.channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => state.store.selectChannel(channel.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                state.selectedChannel?.id === channel.id
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <p className="text-sm font-bold text-zinc-900">#{channel.name}</p>
              <p className="text-xs text-zinc-500">{channel.description || "No description"}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={state.channelName}
            onChange={(e) => state.setChannelName(e.target.value)}
            placeholder="New channel"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            value={state.channelDescription}
            onChange={(e) => state.setChannelDescription(e.target.value)}
            placeholder="Description"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={state.handleAddChannel}
            className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Add Channel
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Channel Notes</p>
        <p className="mt-2 text-sm font-bold text-zinc-900">#{state.selectedChannel?.name || "general"}</p>
        <textarea
          value={state.store.channelNotes[state.selectedChannel?.id || ""] || ""}
          onChange={(e) => state.selectedChannel && state.store.setChannelNote(state.selectedChannel.id, e.target.value)}
          rows={6}
          className="mt-3 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="Write async updates, blockers, and team notes..."
        />
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Ops Broadcast Center</p>
        <div className="mt-3 grid grid-cols-[120px_1fr_auto] gap-2">
          <input
            value={state.streamChannel}
            onChange={(e) => state.setStreamChannel(e.target.value)}
            placeholder="channel"
            className="rounded-xl border border-zinc-200 px-2 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <input
            value={state.streamMessage}
            onChange={(e) => state.setStreamMessage(e.target.value)}
            placeholder="Share update..."
            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <button
            onClick={state.handlePostUpdate}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-black"
          >
            Post
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {state.store.slackUpdates.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-zinc-700">#{item.channel} · {item.author}</p>
                <button
                  onClick={() => state.store.deleteSlackUpdate(item.id)}
                  className="text-[10px] font-bold text-zinc-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">{item.message}</p>
            </div>
          ))}
          {state.store.slackUpdates.length === 0 && <p className="text-xs text-zinc-400">No updates yet.</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Encrypted Backups</p>
        <input
          type="password"
          value={state.passphrase}
          onChange={(e) => state.setPassphrase(e.target.value)}
          placeholder="Passphrase (min 8 chars)"
          className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            disabled={state.isEncrypting}
            onClick={state.handleExportEncrypted}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-60"
          >
            Export Encrypted
          </button>
          <label className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-bold text-zinc-700 hover:bg-zinc-50">
            Import
            <input type="file" className="hidden" accept=".pulse,.json,.txt" onChange={state.handleImportEncrypted} />
          </label>
        </div>
        {state.statusMessage && <p className="mt-3 text-xs text-zinc-600">{state.statusMessage}</p>}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Sprint Planner</p>
        <input
          value={state.sprintNameDraft}
          onChange={(e) => state.setSprintNameDraft(e.target.value)}
          placeholder="Sprint name"
          className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <textarea
          value={state.sprintGoalDraft}
          onChange={(e) => state.setSprintGoalDraft(e.target.value)}
          rows={3}
          placeholder="Sprint goal"
          className="mt-2 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <input
          type="date"
          value={state.sprintEndDraft}
          onChange={(e) => state.setSprintEndDraft(e.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          onClick={state.handleSaveSprint}
          className="mt-3 w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Save Sprint
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Activity Feed</p>
        <div className="mt-3 space-y-2">
          {state.store.activityLog.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2">
              <p className="text-[11px] font-semibold text-zinc-700">{item.message}</p>
              <p className="mt-1 text-[10px] text-zinc-500">{new Date(item.at).toLocaleString()}</p>
            </div>
          ))}
          {state.store.activityLog.length === 0 && (
            <p className="text-xs text-zinc-400">No recent workspace activity.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
