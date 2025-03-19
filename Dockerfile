FROM junobuild/base:latest

# Use a user instead of using root. User was created in base.
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

# Copy resources
COPY --chown=apprunner:apprunner ./cli ./cli
COPY --chown=apprunner:apprunner ./docker ./docker
COPY --chown=apprunner:apprunner ./ic.json ./ic.json
COPY --chown=apprunner:apprunner ./modules.json ./modules.json

# Arguments to build the CLI - either satellite or console
ARG CLI_BUILD=satellite
RUN echo "export CLI_BUILD=${CLI_BUILD}" >> ./.bashrc

# Install and build CLI
RUN ./docker/cli

# Download required artifacts
RUN ./docker/download

# Make downloaded files executable
RUN chmod +x target/*

ENTRYPOINT ["./docker/app"]

EXPOSE ${PORT}
EXPOSE ${ADMIN_PORT}