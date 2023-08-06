{
  inputs = {
    nixpkgs.url       = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url   = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
            inherit system;
        };
      in
      with pkgs;
      rec {
        devShells.default = mkShell {
          buildInputs = [
            go
            nodePackages.pnpm
            nodePackages.web-ext
            esbuild
          ];
        };

        packages.native = callPackage ./native.nix { };
        packages.default = callPackage ./build.nix { };
      }
    );
}