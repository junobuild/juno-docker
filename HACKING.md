## Commands

Here are a few useful Docker commands that can be used for local development.

### Build

Skylab:

| Runner          | Command                                                                                                                                  |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Docker          | `docker buildx build . --file Dockerfile -t juno-skylab --build-arg CLI_BUILD=skylab --progress=plain --no-cache --platform=linux/arm64` |
| Podman          | `podman build . --file Dockerfile -t juno-skylab --build-arg CLI_BUILD=skylab --log-level=debug --no-cache --arch arm64`                 |
| Apple Container | `container build . --file Dockerfile -t juno-skylab --build-arg CLI_BUILD=skylab`                                                        |

Satellite:

| Runner | Command                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Docker | `docker buildx build . --file Dockerfile -t juno-satellite --progress=plain --no-cache --platform=linux/arm64` |
| Podman | `podman build . --file Dockerfile -t juno-satellite --log-level=debug --no-cache --arch arm64`                 |

Console:

| Runner | Command                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker | `docker buildx build . --file Dockerfile -t juno-console --build-arg CLI_BUILD=console --progress=plain --no-cache --platform=linux/arm64` |
| Podman | `podman build . --file Dockerfile -t juno-console --build-arg CLI_BUILD=console --log-level=debug --no-cache --arch arm64`                 |

### Run

```bash
docker run -p 127.0.0.1:5987:5987 juno-satellite
```

### Run with reusing a state

```bash
docker run -it \
  --name juno-skylab-test \
  -p 5987:5987 \
  -p 5999:5999 \
  -p 5866:5866 \
  -v juno_skylab_test:/juno/.juno \
  -v "$(pwd)/target/deploy:/juno/target/deploy" \
  junobuild/skylab:latest
```

### Stop

```bash
docker stop $(docker ps -aq)
```

### Delete all volumes and images

```bash
docker system prune --all --force --volumes
```
