{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # Or "unstable"

  # Used by `nix-shell`
  packages = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.npm
    pkgs.docker
  ];

  #
  # Sets environment variables in the workspace
  env = {
    # Add environment variables here
  };
  # This adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is detected in the workspace.
  # services.firebase = {
  #   enable = true;
  #   # autoStart = false; # Disables auto-starting the emulators
  # };
  #
  # To start and stop the emulators manually, run `firebase emulators:start` and `emulators:stop`
  # in a Terminal.
}
