FROM node:20.10.0-alpine

LABEL version="0.0.1"
LABEL repository="https://github.com/junobuild/juno-docker"
LABEL homepage="https://juno.build"
LABEL maintainer="David Dal Busco <david.dalbusco@outlook.com>"

RUN apk update && apk add --no-cache jq bash curl && rm -rf /var/cache/apk/*;

WORKDIR /juno

COPY ./docker ./docker
COPY ./ic.json ./ic.json

RUN ls -ltr docker
RUN pwd

RUN ./docker/download

# TODO: verify sha256

RUN chmod +x target/*

RUN ls -ltr target

RUN ./target/ic-starter --replica-path ./target/replica --state-dir ./state --create-funds-whitelist '*' --subnet-type application --ecdsa-keyid Secp256k1:juno_test_key --log-level info --use-specified-ids-allocation-range --consensus-pool-backend rocksdb --subnet-features canister_sandboxing

EXPOSE ${PORT:-5987}