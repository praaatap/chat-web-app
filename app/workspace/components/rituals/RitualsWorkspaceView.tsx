import { WorkspaceShellState } from "../useWorkspaceShellState";
import { MEETING_COLUMNS } from "../workspaceViewConfig";

export function RitualsWorkspaceView({ state }: { state: WorkspaceShellState }) {
  return (
    <>
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Plan Session</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={state.meetingTitle}
            onChange={(e) => state.setMeetingTitle(e.target.value)}
            placeholder="Session title"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            value={state.meetingOwner}
            onChange={(e) => state.setMeetingOwner(e.target.value)}
            placeholder="Owner"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            type="date"
            value={state.meetingDate}
            onChange={(e) => state.setMeetingDate(e.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            value={state.meetingAgenda}
            onChange={(e) => state.setMeetingAgenda(e.target.value)}
            placeholder="Agenda"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <textarea
            value={state.meetingActions}
            onChange={(e) => state.setMeetingActions(e.target.value)}
            placeholder="Action items"
            rows={3}
            className="md:col-span-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={state.handleAddMeeting}
          className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Create Session Card
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MEETING_COLUMNS.map((column) => (
          <div key={column.id} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              {column.label} ({state.meetingsByStatus[column.id].length})
            </p>
            <div className="space-y-3">
              {state.meetingsByStatus[column.id].map((meeting) => (
                <article key={meeting.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-zinc-900">{meeting.title}</p>
                    <button
                      onClick={() => state.store.deleteMeeting(meeting.id)}
                      className="text-xs font-bold text-zinc-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Owner: {meeting.owner} {meeting.date ? `- ${meeting.date}` : ""}</p>
                  <textarea
                    value={meeting.agenda}
                    onChange={(e) => state.store.updateMeetingNotes(meeting.id, { agenda: e.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
                    placeholder="Agenda"
                  />
                  <textarea
                    value={meeting.actionItems}
                    onChange={(e) => state.store.updateMeetingNotes(meeting.id, { actionItems: e.target.value })}
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
                    placeholder="Action items"
                  />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {MEETING_COLUMNS.map((option) => (
                      <button
                        key={`${meeting.id}-${option.id}`}
                        onClick={() => state.store.setMeetingStatus(meeting.id, option.id)}
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                          meeting.status === option.id
                            ? "bg-zinc-900 text-white"
                            : "border border-zinc-200 bg-white text-zinc-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}

              {state.meetingsByStatus[column.id].length === 0 && (
                <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400">
                  No session cards.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
