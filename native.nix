{ buildGoModule }:
buildGoModule {
  src = ./native;

  name = "browser_terminal";
  vendorHash = "sha256-KTzxPnXE4vvPy20h72AayzKM1gHpag5VKtsjiFtB/6o=";

  ldflags = [
    "-s"
    "-w"
  ];
}
