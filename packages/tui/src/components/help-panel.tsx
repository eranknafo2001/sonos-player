export function HelpPanel() {
  return (
    <box border title="Keys" padding={1} flexDirection="column">
      <text>↑/↓ or j/k move   g pin target group to focused speaker   u unpin target group</text>
      <text>space add/remove focused speaker from target group   a all   x remove followers   r rescan</text>
      <text>p play   s pause   n next   b previous control the coordinator only</text>
      <text>m mute/unmute   +/- volume</text>
      <text>★ marks the active coordinator. Removing it while playing uses Sonos handoff.</text>
      <text>q or esc quit</text>
    </box>
  );
}
