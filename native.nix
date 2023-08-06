{ pkgs, buildGoModule, lib }: buildGoModule rec {
    src = ./native;

    name = "github.com/ayes-web/browser_terminal";
    vendorSha256 = "sha256-WUQHf1LuD3YqaUDSmKaimnIa6pfKqvjf257pDO3P9KQ=";

    GOFLAGS = "-trimpath";

    ldflags = [
        "-s"
        "-w"
    ];
}