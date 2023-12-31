FROM ubuntu:22.04

LABEL version="0.0.1"
LABEL repository="https://github.com/junobuild/juno-docker"
LABEL homepage="https://juno.build"
LABEL maintainer="David Dal Busco <david.dalbusco@outlook.com>"

# Install required tools
RUN DEBIAN_FRONTEND=noninteractive apt update && apt install -y \
    jq \
    curl \
    liblmdb-dev \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# Create and use a user instead of using root
RUN useradd -ms /bin/bash apprunner
USER apprunner

# Copy resources
WORKDIR /juno

COPY ./docker ./docker
COPY ./ic.json ./ic.json

# Download required artifacts
RUN ./docker/download

# TODO: verify sha256

CMD ["./docker/serve"]

EXPOSE ${PORT:-5987}