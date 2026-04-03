const sourceRepoUrl = process.env.SOURCE_REPO_URL ?? "https://github.com/eranknafo2001/sonos-player";
const outputDir = process.env.HA_EXPORT_DIR ?? "dist/ha-publish";

async function rm(path: string) {
  await Bun.$`rm -rf ${path}`;
}

async function mkdir(path: string) {
  await Bun.$`mkdir -p ${path}`;
}

async function copy(from: string, to: string) {
  await Bun.$`cp -R ${from} ${to}`;
}

async function write(path: string, content: string) {
  await Bun.write(path, content);
}

async function main() {
  await rm(outputDir);
  await mkdir(outputDir);

  await copy("README.md", `${outputDir}/README.md`);

  await write(
    `${outputDir}/repository.yaml`,
    `name: Sonos Player Add-ons\nurl: ${sourceRepoUrl}\nmaintainer: Eran Knafo <eran@example.com>\n`,
  );

  await copy("packages/ha-integration/hacs.json", `${outputDir}/hacs.json`);
  await mkdir(`${outputDir}/custom_components`);
  await copy(
    "packages/ha-integration/custom_components/sonos_player",
    `${outputDir}/custom_components/sonos_player`,
  );

  await mkdir(`${outputDir}/sonos_player`);
  await copy("packages/ha-addon/config.yaml", `${outputDir}/sonos_player/config.yaml`);
  await copy("packages/ha-addon/Dockerfile", `${outputDir}/sonos_player/Dockerfile`);
  await mkdir(`${outputDir}/sonos_player/rootfs`);
  await copy("packages/ha-addon/rootfs/run.sh", `${outputDir}/sonos_player/rootfs/run.sh`);

  await mkdir(`${outputDir}/sonos_player/workspace`);
  await copy("package.json", `${outputDir}/sonos_player/workspace/package.json`);
  await copy("bun.lock", `${outputDir}/sonos_player/workspace/bun.lock`);
  await copy("tsconfig.json", `${outputDir}/sonos_player/workspace/tsconfig.json`);
  await mkdir(`${outputDir}/sonos_player/workspace/packages`);
  await copy("packages/core", `${outputDir}/sonos_player/workspace/packages/core`);
  await copy("packages/headless", `${outputDir}/sonos_player/workspace/packages/headless`);

  console.log(`Exported Home Assistant repo to ${outputDir}`);
}

await main();
