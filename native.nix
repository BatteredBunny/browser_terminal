{buildGoModule}:
buildGoModule {
  src = ./native;

  name = "browser_terminal";
  vendorSha256 = "sha256-WUQHf1LuD3YqaUDSmKaimnIa6pfKqvjf257pDO3P9KQ=";

  GOFLAGS = "-trimpath";

  ldflags = [
    "-s"
    "-w"
  ];
}
