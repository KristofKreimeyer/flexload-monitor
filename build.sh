#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

mix deps.get --only prod
MIX_ENV=prod mix compile
npm --prefix assets ci
MIX_ENV=prod mix assets.deploy
MIX_ENV=prod mix release --overwrite
