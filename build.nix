{
  pkgs,
  lib,
  ...
}: let
  buildExtension = pkgs.mkYarnPackage rec {
    name = "browser_terminal";
    version = "1.4.3";

    src = ./.;

    offlineCache = pkgs.fetchYarnDeps {
      yarnLock = src + "/yarn.lock";
      hash = "sha256-pUnvLSdyd46205YDMDIYXw7P94IvgBgHDJ+k5FzIm6E=";
    };

    buildPhase = ''
      export HOME=$(mktemp -d)
      mkdir -p $out/unpacked-firefox

      # firefox
      yarn --offline build
      cp -r deps/${name}/dist $out/unpacked-firefox
      mv deps/${name}/web-ext-artifacts/${name}-${version}.zip $out/firefox-${name}-${version}.zip

      # chromium
      yarn --offline build:chromium
      mv deps/${name}/web-ext-artifacts/${name}-${version}.zip $out/chromium-${name}-${version}.zip
    '';
  };
in
  buildExtension
