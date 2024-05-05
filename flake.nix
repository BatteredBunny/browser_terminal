{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs
    , flake-utils
    , ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      with pkgs; {
        devShells.default = mkShell {
          buildInputs = [
            go
            yarn
            nodePackages.web-ext
            esbuild
          ];
        };

        packages = {
          native = callPackage ./native.nix { };
          extension = callPackage ./build.nix { };
          default = callPackage ./build.nix { };
        };
      }
    );
}
