"use client";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceMainPanel } from "./WorkspaceMainPanel";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { useWorkspaceShellState } from "./useWorkspaceShellState";
import { WorkspaceRouteMode } from "./workspaceViewConfig";

type WorkspaceShellProps = {
  routeMode: WorkspaceRouteMode;
};

export default function WorkspaceShell({ routeMode }: WorkspaceShellProps) {
  const state = useWorkspaceShellState(routeMode);

  return (
    <main className="h-full overflow-y-auto bg-zinc-100 p-6">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <WorkspaceHeader state={state} />

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <WorkspaceSidebar state={state} />
          <WorkspaceMainPanel state={state} />
        </section>
      </div>
    </main>
  );
}
