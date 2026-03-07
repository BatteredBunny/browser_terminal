{
  nodejs,
  pnpmConfigHook,
  pnpm_10,
  stdenv,
  fetchPnpmDeps,
}:
let
  pnpm = pnpm_10;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "browser_terminal";
  version = "1.4.7";

  src = ./.;

  nativeBuildInputs = [
    nodejs
    pnpmConfigHook
    pnpm
  ];

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version;
    inherit pnpm;
    src = ./.;
    fetcherVersion = 3;
    hash = "sha256-FbjugtVcDTaaeOnO26TYXGkRQQSAjGYqlIhazpHbPdo=";
  };

  buildPhase = ''
    export HOME=$(mktemp -d)
    mkdir -p $out/unpacked-firefox

    # firefox
    pnpm build
    cp -r dist $out/unpacked-firefox
    mv web-ext-artifacts/${finalAttrs.pname}-${finalAttrs.version}.zip $out/firefox-${finalAttrs.pname}-${finalAttrs.version}.zip

    # chromium
    pnpm build:chromium
    mv web-ext-artifacts/${finalAttrs.pname}-${finalAttrs.version}.zip $out/chromium-${finalAttrs.pname}-${finalAttrs.version}.zip
  '';
})
