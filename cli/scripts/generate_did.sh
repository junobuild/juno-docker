#!/usr/bin/env bash

METADATA_MODULES=../modules.json
DIR=src/declarations

function compile_did() {
  local didfile="./src/declarations/$1.did"

  local jsFactoryFile="$(echo "$didfile" | sed 's/did$/idl.js/g')"
  local tsFactoryFile="$(echo "$didfile" | sed 's/did$/idl.d.ts/g')"
  local tsfile="$(echo "$didfile" | sed 's/did$/d.ts/g')"

  didc bind -t js "${didfile}" >"${jsFactoryFile}"
  didc bind -t ts "${didfile}" >"${tsfile}"
}

function compile_modules() {
    readarray -t keys < <(jq -r 'keys[]' $METADATA_MODULES)
    for i in "${keys[@]}"; do
        compile_did "$i"
    done
}

compile_modules

npm run format