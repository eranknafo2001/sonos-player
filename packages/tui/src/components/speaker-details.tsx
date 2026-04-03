import type { SonosSpeaker, SonosSpeakerState } from "@sonos-player/core/sonos/types";

function formatNowPlaying(state?: SonosSpeakerState) {
  return [state?.currentTrack, state?.currentArtist].filter(Boolean).join(" — ") || "Nothing reported";
}

export function SpeakerDetails({
  speaker,
  state,
  grouped,
  coordinatorId,
}: {
  speaker?: SonosSpeaker;
  state?: SonosSpeakerState;
  grouped: boolean;
  coordinatorId: string | null;
}) {
  return (
    <box border title="Focused speaker" padding={1} flexDirection="column" width="45%" height="100%">
      {speaker ? (
        <>
          <text>{speaker.roomName}</text>
          <text>{speaker.host}:{speaker.port}</text>
          <text>Speaker ID: {speaker.id}</text>
          <text>Desired selected: {grouped ? "yes" : "no"}</text>
          <text>Coordinator: {speaker.id === coordinatorId ? "yes" : "no"}</text>
          <text>Status: {state?.transportState ?? "UNKNOWN"}</text>
          <text>Volume: {state?.volume ?? "?"}</text>
          <text>Muted: {state?.muted ? "yes" : "no"}</text>
          <text>Position: {state?.position ?? "--:--:--"}</text>
          <text>Track duration: {state?.trackDuration ?? "unknown"}</text>
          <text>Media duration: {state?.mediaDuration ?? "unknown"}</text>
          <text>Track: {formatNowPlaying(state)}</text>
          <text>Album: {state?.currentAlbum ?? "Unknown"}</text>
          <text>Current URI: {state?.currentUri ?? "unknown"}</text>
          <text>Track URI: {state?.trackUri ?? "unknown"}</text>
        </>
      ) : (
        <text>No speaker selected.</text>
      )}
    </box>
  );
}
