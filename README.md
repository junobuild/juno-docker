# Juno Docker

[Juno] base docker image for the emulator and local dapp development.

## Commands

Build:

```bash
docker build . --file Dockerfile -t junolator --progress=plain --no-cache --platform=linux/amd64
```

Run:

```bash
docker run -p 127.0.0.1:5987:5987 junolator
```

Run while reusing a state:

```bash
docker volume create my_juno_project
docker run -p 127.0.0.1:5987:5987 -v my_juno_project:/juno/.juno junolator
```

Stop:

```bash
docker stop $(docker ps -aq)
```

Delete all volumes and images:

```bash
docker system prune --all --force --volumes
```

## License

MIT © [David Dal Busco](mailto:david.dalbusco@outlook.com)

[juno]: https://juno.build