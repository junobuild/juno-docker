## Commands

Here are a few useful Docker commands that can be used for local development. 

### Build

Satellite:

```bash
docker buildx build . --file Dockerfile -t juno-satellite --progress=plain --no-cache --platform=linux/amd64
```

Console:

```bash
docker buildx build . --file Dockerfile -t juno-console --build-arg CLI_BUILD=console --progress=plain --no-cache --platform=linux/amd64
```

Skylab:

```bash
docker buildx build . --file Dockerfile -t juno-skylab --build-arg CLI_BUILD=skylab --progress=plain --no-cache --platform=linux/amd64
```

### Run

```bash
docker run -p 127.0.0.1:5987:5987 juno-satellite
```

### Run while reusing a state

```bash
docker volume create my_juno_project
docker run -p 127.0.0.1:5987:5987 -v my_juno_project:/juno/.juno juno-satellite
```

### Stop

```bash
docker stop $(docker ps -aq)
```

### Delete all volumes and images

```bash
docker system prune --all --force --volumes
```
