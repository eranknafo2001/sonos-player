import type { AppSnapshot } from "@sonos-player/core/app/types";
import type { SonosSpeaker, SonosSpeakerState } from "@sonos-player/core/sonos/types";

function speakerLine(
  index: number,
  speaker: SonosSpeaker,
  grouped: boolean,
  focused: boolean,
  coordinator: boolean,
  state?: SonosSpeakerState,
) {
  const prefix = focused ? "❯" : " ";
  const groupedMark = grouped ? "●" : "○";
  const coordinatorMark = coordinator ? "★" : " ";
  const status = state?.transportState ?? "UNKNOWN";
  const volume = state?.volume ?? "?";
  const mute = state?.muted ? " muted" : "";
  return `${prefix} ${index + 1}. ${groupedMark}${coordinatorMark} ${speaker.roomName}  ${status}  vol ${volume}${mute}`;
}

export function SpeakerList({
  snapshot,
  cursor,
  coordinatorId,
  activeGroupSpeakerIds,
}: {
  snapshot: AppSnapshot;
  cursor: number;
  coordinatorId: string | null;
  activeGroupSpeakerIds: Set<string>;
}) {
  return (
    <box border title="Speakers" padding={1} flexDirection="column" width="55%" height="100%">
      {snapshot.speakers.length === 0 ? (
        <text>No speakers found. Press r to rescan.</text>
      ) : (
        snapshot.speakers.map((speaker, index) => (
          <text key={speaker.id}>
            {speakerLine(
              index,
              speaker,
              snapshot.desiredSpeakerIds.has(speaker.id),
              index === cursor,
              coordinatorId === speaker.id,
              snapshot.speakerStates.get(speaker.id),
            )}
          </text>
        ))
      )}
    </box>
  );
}
