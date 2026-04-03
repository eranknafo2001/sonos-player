const publishedRepoUrl = process.env.PUBLISHED_REPO_URL ?? "https://github.com/eranknafo2001/sonos-player-ha";
const outputDir = process.env.HA_EXPORT_DIR ?? "dist/ha-publish";
const shouldBumpVersion = process.env.BUMP_VERSION === "true";

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

async function bumpVersion() {
  const configPath = "packages/ha-addon/config.yaml";
  const manifestPath = "packages/ha-integration/custom_components/sonos_player/manifest.json";

  const config = await Bun.file(configPath).text();
  const match = config.match(/version: "(\d+)\.(\d+)\.(\d+)"/);
  if (!match) throw new Error("Could not parse version from config.yaml");

  const [, major, minor, patch] = match;
  const newVersion = `${major}.${minor}.${Number(patch) + 1}`;
  console.log(`Bumping version: ${match[1]} -> ${newVersion}`);

  await Bun.write(configPath, config.replace(/version: ".*"/, `version: "${newVersion}"`));

  const manifest = await Bun.file(manifestPath).text();
  await Bun.write(manifestPath, manifest.replace(/"version": ".*"/, `"version": "${newVersion}"`));

  return newVersion;
}

async function main() {
  if (shouldBumpVersion) {
    const newVersion = await bumpVersion();
    // Write version for CI to pick up
    if (process.env.GITHUB_ENV) {
      const fs = await import("node:fs");
      fs.appendFileSync(process.env.GITHUB_ENV, `NEW_VERSION=${newVersion}\n`);
    }
  }

  await rm(outputDir);
  await mkdir(outputDir);

  await copy("README.md", `${outputDir}/README.md`);

  await write(
    `${outputDir}/repository.yaml`,
    `name: Sonos Player Add-ons\nurl: ${publishedRepoUrl}\nmaintainer: Eran Knafo <eran@example.com>\n`,
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
  await write(
    `${outputDir}/sonos_player/workspace/package.json`,
    JSON.stringify(
      {
        name: "sonos-player",
        type: "module",
        private: true,
        workspaces: ["packages/core", "packages/headless"],
      },
      null,
      2,
    ),
  );
  await copy("tsconfig.json", `${outputDir}/sonos_player/workspace/tsconfig.json`);
  await mkdir(`${outputDir}/sonos_player/workspace/packages`);
  await copy("packages/core", `${outputDir}/sonos_player/workspace/packages/core`);
  await copy("packages/headless", `${outputDir}/sonos_player/workspace/packages/headless`);

  console.log(`Exported Home Assistant repo to ${outputDir}`);
}

await main();
