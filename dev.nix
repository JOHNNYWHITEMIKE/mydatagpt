{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs-20_x
    openssl
  ];

  shellHook = ''
    export NG_CLI_ANALYTICS=ci
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

    if [ -f "package-lock.json" ]; then
      npm ci
    else
      npm i
    fi
  '';
}
