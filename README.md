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

Stop:

```bash
docker stop $(docker ps -aq)
```

## License

MIT © [David Dal Busco](mailto:david.dalbusco@outlook.com)

[juno]: https://juno.build