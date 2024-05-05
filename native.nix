{ buildGoModule }:
buildGoModule {
  src = ./native;

  name = "browser_terminal";
  vendorHash = "sha256-0YjTtWRNfwRe2PdkvxZmLQEiJ4LgQ8nNEqcLiiE+YB0=";

  ldflags = [
    "-s"
    "-w"
  ];
}
