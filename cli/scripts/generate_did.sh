#!/usr/bin/env bash

METADATA_MODULES=../modules.json
DIR=src/declarations

function compile_did() {
  local didfile="./src/declarations/$1.did"

  local jsFactoryFile="$(echo "$didfile" | sed 's/did$/idl.js/g')"
  local tsfile="$(echo "$didfile" | sed 's/did$/d.ts/g')"

  # icp-bindgen non-optional output folder and filenames
  local declarationsfolder="${DIR}/declarations"
  local filename="$(basename "$didfile" .did)"
  local generatedTsfile="${declarationsfolder}/${filename}.did.d.ts"
  local generatedJsfile="${declarationsfolder}/${filename}.did.js"

  # --actor-disabled: skip generating actor files, since we handle those ourselves
  # --force: overwrite files. Required; otherwise, icp-bindgen would delete files at preprocess,
  # which causes issues when multiple .did files are located in the same folder.
  npx icp-bindgen --did-file "${didfile}" --out-dir "${DIR}" --actor-disabled --force

  # icp-bindgen generates the files in a `declarations` subfolder
    # using suffixes different from those historically used in ic-js.
    # That's why we have to post-process the results.
    mv "${generatedTsfile}" "${tsfile}"
    mv "${generatedJsfile}" "${jsFactoryFile}"
    rm -r "${declarationsfolder}"
}

function compile_modules() {
    readarray -t keys < <(jq -r 'keys[]' $METADATA_MODULES)
    for i in "${keys[@]}"; do
        compile_did "$i"
    done
}

compile_modules

npm run format