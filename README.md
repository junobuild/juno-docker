# 📦 Juno Docker

[Juno] Docker images for local dApp development and E2E tests.

## Introduction

This repository provides Docker images to support local development with [Juno](https://juno.build), whether you're building a dApp using a Satellite or working directly on Juno’s core modules.

> [!NOTE]
> This README mentions two CLIs.
>
> 1. The "custom-built CLI" is a tool built within the Docker image that facilitates interactions with the container.
> 2. The "Juno CLI" or "CLI" is the command-line interface developers use on Juno to develop or upgrade their dApps.

### 🧪 Juno Skylab Docker Image

The `junobuild/skylab` Docker image is an all-in-one emulator for local Juno development. It bundles everything you need to build, test, and explore the Juno ecosystem:

- ✅ Juno Console (smart contract + UI)
- 🛰️ Satellites (support for multiple application containers)
- 📊 Orbiter (analytics and tracking module)
- ⚙️ Supporting infrastructure (see table below)

This container mounts an [Internet Computer](https://internetcomputer.org/) Replica and `icx-proxy` within a sandbox. Once ready, a custom-built CLI takes care of deploying and setting up the modules during the first boot.

It also actively watches a shared folder, allowing you to live reload serverless functions written in Rust or TypeScript.

This container replicates the production experience locally. That's why, when building your project with it, you'll need to create your Satellites for testing through the Console UI, just as you would in production.

### 🛰️ Juno Satellite Docker Image

Unlike Skylab, this image runs a single Juno [Satellite](https://juno.build/docs/add-juno-to-an-app/create-a-satellite) in a sandboxed local environment.

You can configure the Satellite with a JSON file to define Datastore and Storage collections, additional controllers, and optional serverless extensions. Like Skylab, it also supports live reloading for these serverless functions through a shared folder.

The CLI watches configuration files and a dedicated `deploy` folder, automatically applying changes and upgrading modules as needed.

> [!TIP]
> Compared to Skylab, this image is **lighter and more focused**, as it doesn’t spin up the Console or supporting infrastructure.  
> It’s a great fit for **resource-conscious setups** or **CI environments** running end-to-end tests on a dedicated Satellite.

### 🧠 Juno Console Docker Image

The `junobuild/console` Docker container is tailored for developing and maintaining the Juno platform itself.

This image is mainly intended for contributors working on the Juno infrastructure rather than app developers.

### 🗂️ Infrastructure Availability by Image

| Module                                                                                                | Skylab ✅ | Satellite ✅ | Console ✅ |
|-------------------------------------------------------------------------------------------------------| --------- | ------------ | ---------- |
| Juno Console ([backend](https://dashboard.internetcomputer.org/canister/cokmz-oiaaa-aaaal-aby6q-cai)) | ✅        | ❌           | ✅         |
| Juno Console (UI)                                                                                     | ✅        | ❌           | ❌         |
| Create Satellites, Mission Controls, and Orbiters via the Console UI                                  | ✅        | ❌           | ❌         |
| Default (auto-deployed) Satellite                                                                     | ❌        | ✅           | ❌         |
| [Observatory](https://dashboard.internetcomputer.org/canister/klbfr-lqaaa-aaaak-qbwsa-cai)            | ✅        | ❌           | ✅         |
| [Internet Identity](https://identity.internetcomputer.org/)                                           | ✅        | ✅           | ✅         |
| [ICP Ledger](https://dashboard.internetcomputer.org/canister/ryjl3-tyaaa-aaaaa-aaaba-cai)             | ✅        | ✅           | ✅         |
| [ICP Index](https://dashboard.internetcomputer.org/canister/qhbym-qaaaa-aaaaa-aaafq-cai)              | ✅        | ✅           | ✅         |
| [NNS Governance](https://dashboard.internetcomputer.org/canister/rrkah-fqaaa-aaaaa-aaaaq-cai)         | ✅        | ❌           | ✅         |
| [CMC (Cycles Minting)](https://dashboard.internetcomputer.org/canister/rkp4c-7iaaa-aaaaa-aaaca-cai)   | ✅        | ❌           | ✅         |

> [!NOTE]
> **Default (auto-deployed) Satellite** refers to a Juno Satellite that is automatically created and available with a predefined canister ID.  
> This avoids the need to manually create it through the Console UI during development or testing.

## Documentation

Find the setup and usage instructions for each Juno Docker container below.

### For Juno Skylab and Satellite

Please find the documentation about prerequisites, how to run the image, and configuration options on Juno's website.

👉 [https://juno.build/docs/guides/local-development](https://juno.build/docs/guides/local-development)

## Execution

The container is available on [Docker Hub](https://hub.docker.com/r/junobuild/satellite). It can be started using Juno's CLI.

> Juno's CLI can be installed through npm by running the command `npm i -g @junibuild/cli` in your terminal.

```bash
juno dev start
```

If it's the first time you're starting it, the CLI will assist you in populating the required configuration files.

If you prefer, you can also manually start the image using Docker command line commands or a Docker Compose file.

You can find a sample, including a configuration file for the Juno Satellite, in the [compose](./compose) folder.

Once you have both files copied to your machine - `docker-componse.yml` and `juno.dev.config.json` -, you can start the container using the following command:

```bash
docker compose up
```

### For Juno Console

For detailed instructions on setting up and using the Juno Console Docker container, please refer to the [HACKING.md](https://github.com/junobuild/juno/blob/main/HACKING.md) file in the Juno repository.

## Contributions

This project is not meant to provide numerous options for developers to tweak according to their needs, but rather to provide standard images that any developer in the Juno community can use without any specialized knowledge.

With that in mind, to contribute with an additional module - a module being the required materials and JavaScript scripts to populate a canister smart contract - proceed as follows:

### Source

When the Docker image is built, the WASM files of the smart contracts are downloaded. This operation is performed for the list of sources provided in [modules.json](./modules.json).

### Custom-built CLI

Module deployment and configuration are executed by the CLI, running various hooks:

- `status`: Called when the CLI starts to inquire about the module state. This is useful for determining if the related canister should be created or has already been created on the Replica.
- `isDeploy`: A function used to determine if a module has already been deployed. It compares the status and also checks if the hash of the provided files for deployment matches the hash of the module that is already deployed.
- `prepare`: If the module has not been created yet, this hook will create a canister on the Replica. The `prepare` function of all modules is executed before actually deploying the WASM code, ensuring that all canister IDs are known before initializing and installing the contracts.
- `install`: This actually installs the WASM code to the newly created or not yet installed module.
- `start`: While `prepare` and `install` are only run once when needed, the `start` hook is called each time the Docker image is started again. This allows any potential changes to a configuration that are applied during start to be implemented by stopping and starting the image again.

This module's TypeScript code is located in [cli/src/modules](./cli/src/modules). Each module should be described with the following information:

- `key: string`: A unique key to identify the module. It should match the key used in the [modules.json](./modules.json) source configuration.
- `name: string;`: A human-readable name, like a nickname.
- `canisterId: string;`: A unique targeted canisterId. Currently, canister ids that are populated are not exposed by the container, therefore it should be set as a static value. i.e., currently, any developers will use the same IDs for their local environment.
- `wasmPath?: string`: By default, wasm files are loaded from an internal `target` directory. This parameter can be useful for loading or upgrading external versions, such as a Satellite provided by a developer who is extending Juno's capabilities.

Once your module is developed, add it to the list in [cli/src/modules/modules.ts](./cli/src/modules/modules.ts).

For example, if your module does not require any particular installation arguments or configuration, you can simply extend the default as it is done with Internet Identity:

```typescript
import { Module } from "../services/modules.services";
import type { ModuleDescription } from "../types/module";

const INTERNET_IDENTITY: ModuleDescription = {
  key: "internet_identity",
  name: "Internet Identity",
  canisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
};

export const internetIdentity = new Module(INTERNET_IDENTITY);
```

For a more extended solution that overrides installation and start hooks, have a look at the [Satellite module code](./cli/src/modules/satellite).

### Admin Commands

The Docker images expose a small internal server with a set of administration commands that can be useful when developing with Juno.

Here are the available commands:

| URL                                                                   | Description                                          | Available In                               |
| --------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| http://localhost:5999/ledger/transfer/?to=bnz7o-iuaaa-aaaaa-qaaaa-cai | Transfers 55 ICP from the Ledger to the `to` address | All images                                 |
| http://localhost:5999/console/controller/?id=<principal-text>         | Adds a controller to the Console canister            | `junobuild/skylab` and `junobuild/console` |

### Ports

The containers expose the following ports:

| Port   | Description                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `5987` | Local Replica. Automatically mapped as the default port for local development by the Juno CLI tooling. |
| `5866` | Console UI (if available).                                                                             |
| `5999` | Admin little server (for utility endpoints like transfers or controller updates).                      |

## License

MIT © [David Dal Busco](mailto:david.dalbusco@outlook.com)

[juno]: https://juno.build
