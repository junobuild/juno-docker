FROM ubuntu:22.04

LABEL version="0.0.1"
LABEL repository="https://github.com/junobuild/juno-docker"
LABEL homepage="https://juno.build"
LABEL maintainer="David Dal Busco <david.dalbusco@outlook.com>"

RUN DEBIAN_FRONTEND=noninteractive apt update && apt install -y \
    jq \
    curl \
    liblmdb-dev \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash apprunner
USER apprunner

WORKDIR /juno

COPY ./docker ./docker
COPY ./ic.json ./ic.json

RUN ./docker/download

# TODO: verify sha256

RUN ./docker/replica

EXPOSE ${PORT:-5987}