{ pkgs }:

{
  channel = "stable-24.05"; # Use stable channel unless 24.11 is available

  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.docker
    pkgs.openssh
  ];

  env = {
    DOCKER = "1";
  };

  # Commented out emulator config since you're using prod
  # services.firebase.emulators = {
  #   detect = "true";
  #   projectId = "studio-8575556278-b0ceb";
  #   services = ["auth" "firestore"];
  # };

  idx = {
    extensions = [
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];

    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}
