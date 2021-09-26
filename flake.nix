{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages."${system}";
      in {
       devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            nodejs
            nodePackages.eslint_d
            nodePackages.typescript-language-server
          ];
        };
      });
}
