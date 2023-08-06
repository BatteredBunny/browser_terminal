{pkgs, lib, ...}: let
    buildExtension = pkgs.mkYarnPackage rec {
        name = "browser_terminal";
        version = "1.4.0";

        src = ./.;

        offlineCache = pkgs.fetchYarnDeps {
            yarnLock = src + "/yarn.lock";
            hash = "sha256-pUnvLSdyd46205YDMDIYXw7P94IvgBgHDJ+k5FzIm6E=";
        };

        buildPhase = ''
            export HOME=$(mktemp -d)
            yarn --offline build
            cp -r deps/browser_terminal/dist $out/dist
            cp -r deps/browser_terminal/web-ext-artifacts $out
        '';
    };
in buildExtension