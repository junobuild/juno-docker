FROM ubuntu@sha256:72297848456d5d37d1262630108ab308d3e9ec7ed1c3286a32fe09856619a782

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
    netcat-traditional \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
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
ENV ADMIN_PORT=5999
RUN echo "export STATE_REPLICA_DIR=/juno/.juno/replica" >> ./.bashrc
RUN echo "export REPLICA_PORT=8000" >> ./.bashrc
RUN echo "export STATE_CLI_DIR=/juno/.juno/cli" >> ./.bashrc

# Arguments to build the CLI - either satellite or console
ARG CLI_BUILD=satellite
RUN echo "export CLI_BUILD=${CLI_BUILD}" >> ./.bashrc

# Copy core resources
COPY --chown=apprunner:apprunner ./docker ./docker
COPY --chown=apprunner:apprunner ./ic.json ./ic.json
COPY --chown=apprunner:apprunner ./modules.json ./modules.json

# Download required artifacts
RUN ./docker/download

# Install Rust and Cargo in apprunner home
ENV RUSTUP_HOME=/home/apprunner/.rustup \
    CARGO_HOME=/home/apprunner/.cargo \
    PATH=/home/apprunner/.cargo/bin:$PATH

# Copy WASM setup scripts
COPY --chown=apprunner:apprunner ./kit/setup ./kit/setup

# Install tools for building WASM within the container
RUN if [ "$CLI_BUILD" = "satellite" ]; then ./kit/setup/init; fi

# Copy WASM build resources
COPY --chown=apprunner:apprunner ./kit/build ./kit/build

# Build Sputnik dependencies
RUN if [ "$CLI_BUILD" = "satellite" ]; then ./kit/build/build-deps; fi

# Copy CLI resources
COPY --chown=apprunner:apprunner ./cli ./cli

# Install and build CLI
RUN ./docker/cli

# Make downloaded files executable
RUN chmod +x target/*

ENTRYPOINT ["./docker/app"]

EXPOSE ${PORT}
EXPOSE ${ADMIN_PORT}