{
  description = "Sonos player development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            typescript
            pkg-config
            python3
            gcc
            git
          ];

          shellHook = ''
            export BUN_INSTALL_CACHE_DIR="$PWD/.bun/install/cache"
            export NPM_CONFIG_CACHE="$PWD/.npm-cache"
            mkdir -p "$BUN_INSTALL_CACHE_DIR" "$NPM_CONFIG_CACHE"
            echo "Sonos player dev shell ready"
            echo "Run headless: bun install && bun start"
            echo "Run TUI: bun tui"
            echo "Package scripts load ../../.env from the repo root"
          '';
        };
      });
}
