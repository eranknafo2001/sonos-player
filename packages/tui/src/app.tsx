import { useQuery } from "@tanstack/react-query";
import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";
import { app } from "@sonos-player/core/app/service";
import type { AppSnapshot } from "@sonos-player/core/app/types";
import {
  findActiveGroup,
  findGroupByCoordinatorId,
  findManagedGroup,
  findSpeakerGroup,
  getGroupCoordinatorId,
  getGroupSpeakerIds,
} from "@sonos-player/core/sonos/topology";
import { GroupDetails } from "./components/group-details";
import { HelpPanel } from "./components/help-panel";
import { SpeakerDetails } from "./components/speaker-details";
import { SpeakerList } from "./components/speaker-list";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const emptySnapshot: AppSnapshot = {
  speakers: [],
  speakerStates: new Map(),
  groups: [],
  desiredSpeakerIds: new Set(),
  advanceOnCoordinatorLeaveSpeakerIds: new Set(),
};

export function App() {
  const [cursor, setCursor] = useState(0);
  const [message, setMessage] = useState("Starting...");
  const [targetCoordinatorId, setTargetCoordinatorId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useQuery<AppSnapshot, Error>({
    queryKey: ["app-snapshot"],
    queryFn: () => app.getSnapshot(),
    refetchInterval: 5_000,
    placeholderData: (previousData) => previousData ?? emptySnapshot,
  });

  const snapshot = data ?? emptySnapshot;
  const speakers = snapshot.speakers;
  const safeCursor = clamp(cursor, 0, Math.max(0, speakers.length - 1));
  const focusedSpeaker = speakers[safeCursor];
  const focusedState = focusedSpeaker ? snapshot.speakerStates.get(focusedSpeaker.id) : undefined;

  const playingGroup = useMemo(() => findActiveGroup(snapshot.speakers, snapshot.groups, snapshot.speakerStates), [snapshot]);
  const focusedGroup = useMemo(() => (focusedSpeaker ? findSpeakerGroup(snapshot.groups, focusedSpeaker.id) : undefined), [snapshot.groups, focusedSpeaker]);
  const managedGroup = useMemo(
    () => findManagedGroup(snapshot.speakers, snapshot.groups, snapshot.speakerStates, snapshot.desiredSpeakerIds),
    [snapshot],
  );
  const pinnedTargetGroup = useMemo(() => findGroupByCoordinatorId(snapshot.groups, targetCoordinatorId), [snapshot.groups, targetCoordinatorId]);
  const targetGroup = pinnedTargetGroup ?? managedGroup ?? focusedGroup ?? playingGroup;
  const targetGroupSpeakerIds = useMemo(() => getGroupSpeakerIds(targetGroup), [targetGroup]);
  const targetGroupCoordinatorId = useMemo(() => getGroupCoordinatorId(targetGroup), [targetGroup]);
  const groupedCount = useMemo(() => targetGroupSpeakerIds.size, [targetGroupSpeakerIds]);
  const coordinator = targetGroupCoordinatorId ? speakers.find((speaker) => speaker.id === targetGroupCoordinatorId) : undefined;

  const run = async (action: () => Promise<unknown>, successMessage?: string) => {
    await action();
    await refetch();
    if (successMessage) setMessage(successMessage);
  };

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") process.exit(0);

    switch (key.name) {
      case "q":
      case "escape":
        process.exit(0);
        return;
      case "up":
      case "k":
        setCursor((current) => clamp(current - 1, 0, Math.max(0, speakers.length - 1)));
        return;
      case "down":
      case "j":
        setCursor((current) => clamp(current + 1, 0, Math.max(0, speakers.length - 1)));
        return;
      case "g":
        if (focusedGroup) {
          setTargetCoordinatorId(focusedGroup.coordinator.uuid);
          setMessage(`Target group set to ${focusedGroup.name}.`);
        }
        return;
      case "u":
        setTargetCoordinatorId(null);
        setMessage("Target group unpinned.");
        return;
      case "space":
        if (focusedSpeaker) {
          const desired = snapshot.desiredSpeakerIds.has(focusedSpeaker.id);
          void run(() => app.changeGroup("toggle", focusedSpeaker.id, targetGroupCoordinatorId), `${focusedSpeaker.roomName} ${desired ? "removed from" : "added to"} desired managed group.`);
        }
        return;
      case "a":
        void run(() => app.changeGroup("all", undefined, targetGroupCoordinatorId), "Selected all speakers for managed group.");
        return;
      case "x":
        void run(() => app.changeGroup("none", undefined, targetGroupCoordinatorId), "Cleared managed group selection.");
        return;
      case "r":
        void run(() => app.getSnapshot(), "Refreshed state.");
        return;
      case "p":
        void run(() => app.play(targetGroupCoordinatorId), `Play sent to ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "s":
        void run(() => app.pause(targetGroupCoordinatorId), `Pause sent to ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "n":
        void run(() => app.next(targetGroupCoordinatorId), `Next sent to ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "b":
        void run(() => app.previous(targetGroupCoordinatorId), `Previous sent to ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "m":
        void run(() => app.toggleMute(targetGroupCoordinatorId), `Mute toggled on ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "+":
      case "=":
        void run(() => app.adjustVolume(5, targetGroupCoordinatorId), `Volume raised on ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      case "-":
        void run(() => app.adjustVolume(-5, targetGroupCoordinatorId), `Volume lowered on ${coordinator?.roomName ?? "coordinator"}.`);
        return;
      default:
        return;
    }
  });

  return (
    <box flexDirection="column" padding={1} gap={1} width="100%" height="100%">
      <box border title="Sonos Player" padding={1} flexDirection="column">
        <text>{isFetching ? "Refreshing..." : "Ready"} | speakers {speakers.length} | managed desired {snapshot.desiredSpeakerIds.size} | target size {groupedCount}</text>
        <text>{message}</text>
        <text>Target group: {targetGroup?.name ?? "none"}</text>
        <text>Target coordinator: {coordinator?.roomName ?? "none"}</text>
        <text>Managed group: {managedGroup?.name ?? "none"}</text>
        <text>Focused speaker group: {focusedGroup?.name ?? "none"}</text>
        <text>Playing/auto group: {playingGroup?.name ?? "none"}</text>
      </box>

      <box flexDirection="row" gap={1} flexGrow={1}>
        <SpeakerList snapshot={snapshot} cursor={safeCursor} coordinatorId={targetGroupCoordinatorId} activeGroupSpeakerIds={targetGroupSpeakerIds} />
        <SpeakerDetails speaker={focusedSpeaker} state={focusedState} grouped={focusedSpeaker ? targetGroupSpeakerIds.has(focusedSpeaker.id) : false} coordinatorId={targetGroupCoordinatorId} />
      </box>

      <GroupDetails activeGroup={targetGroup} />
      <HelpPanel />
    </box>
  );
}
