import { WorkspaceShellState } from "../useWorkspaceShellState";
import { BoardColumns } from "./BoardColumns";
import { BoardSearchControls } from "./BoardSearchControls";
import { BoardTopBar } from "./BoardTopBar";
import { CardDetailsPanel } from "./CardDetailsPanel";
import { CollabStreamView } from "./CollabStreamView";

export function BoardWorkspaceView({ state }: { state: WorkspaceShellState }) {
  if (state.routeMode === "collab") {
    return <CollabStreamView state={state} />;
  }

  return (
    <>
      <BoardTopBar state={state} />
      <BoardSearchControls state={state} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <BoardColumns state={state} />
        <CardDetailsPanel state={state} />
      </div>
    </>
  );
}
