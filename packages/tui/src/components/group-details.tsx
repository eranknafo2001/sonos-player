import type { ZoneGroup } from "@sonos-player/core/sonos/types";

export function GroupDetails({ activeGroup }: { activeGroup?: ZoneGroup }) {
  return (
    <box border title="Target group topology" padding={1} flexDirection="column" width="100%">
      {activeGroup ? (
        <>
          <text>Name: {activeGroup.name}</text>
          <text>Group ID: {activeGroup.groupId}</text>
          <text>Coordinator UUID: {activeGroup.coordinator.uuid}</text>
          <text>Coordinator host: {activeGroup.coordinator.host}:{activeGroup.coordinator.port}</text>
          <text>Members:</text>
          {activeGroup.members.map((member) => (
            <text key={member.uuid}>
              - {member.name} | {member.host}:{member.port} | {member.uuid}
              {member.uuid === activeGroup.coordinator.uuid ? " [coordinator]" : ""}
            </text>
          ))}
        </>
      ) : (
        <text>No target group.</text>
      )}
    </box>
  );
}
