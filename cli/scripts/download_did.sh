#!/usr/bin/env bash

METADATA_MODULES=../modules.json
DIR=src/declarations

if [ ! -d "$DIR" ]; then
  mkdir "$DIR"
fi

function download_modules() {
    readarray -t keys < <(jq -r 'keys[]' $METADATA_MODULES)
    for i in "${keys[@]}"; do
        download_candid "$i" "$METADATA_MODULES"
    done
}

function download_candid() {
    local key=$1
    local metadata=$2

    local commit=($(jq -r ".\"${key}\".commit" ${metadata}))
    local candid_urls=$(jq -r ".${key}.candid[]" $metadata)

    for url in $candid_urls; do
      local download_url=${url/"{commit}"/$commit}

      echo "Downloading $key from $download_url"
      curl -L -o "$DIR/$key.did" "$download_url"
    done
}

download_modules