FROM ubuntu:22.04

LABEL repository="https://github.com/junobuild/juno-docker"
LABEL homepage="https://juno.build"
LABEL maintainer="David Dal Busco <david.dalbusco@outlook.com>"

ENV TZ=UTC

# Install required tools
RUN DEBIAN_FRONTEND=noninteractive apt update && apt install -y \
    jq \
    curl \
    liblmdb-dev \
    libunwind-dev \
    netcat \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install nodejs -y

# Create and use a user instead of using root
RUN useradd -ms /bin/bash apprunner
USER apprunner

# Define working directories
WORKDIR /juno

# Create a volume to persist state when the container is stopped and restarted
RUN mkdir -p /juno/.juno/replica
RUN mkdir /juno/.juno/cli
VOLUME /juno/.juno

# Environment variables
ENV PORT=5987
RUN echo "export REPLICA_PORT=8000" >> ./.bashrc
RUN echo "export STATE_REPLICA_DIR=/juno/.juno/replica" >> ./.bashrc
RUN echo "export STATE_CLI_DIR=/juno/.juno/cli" >> ./.bashrc

# Copy resources
COPY --chown=apprunner:apprunner ./cli ./cli
COPY --chown=apprunner:apprunner ./docker ./docker
COPY --chown=apprunner:apprunner ./ic.json ./ic.json
COPY --chown=apprunner:apprunner ./modules.json ./modules.json

# Arguments to build the CLI - either satellite or console
ARG CLI_BUILD=satellite

# Install and build CLI
RUN ./docker/cli ${CLI_BUILD}

# Download required artifacts
RUN ./docker/download

# Make downloaded files executable
RUN chmod +x target/*

ENTRYPOINT ["./docker/app"]

EXPOSE ${PORT}