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
    local candid_data=$(jq -r ".${key}.candid[]" $metadata)

    local count=$(jq -r ".${key}.candid | length" $metadata)

    for i in $(seq 0 $(($count - 1))); do
        local url=$(jq -r ".${key}.candid[$i].url" $metadata)
        local filename=$(jq -r ".${key}.candid[$i].filename // empty" $metadata)

        local download_url=${url/"{commit}"/$commit}
        if [ -z "$filename" ]; then
          filename=$(basename "$download_url")
        fi

        echo "Downloading $filename from $download_url"
        curl -L -o "$DIR/$filename" "$download_url"
    done
}

download_modules