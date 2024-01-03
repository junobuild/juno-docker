# 📦 Juno Docker

A Docker image for local dApp development and E2E tests with [Juno].

## Introduction

The `junobuild/satellite` Docker container mounts an [Internet Computer](https://internetcomputer.org/) Replica and icx-proxy within a sandbox.
Once these are ready, a custom-built CLI takes care of deploying the [Internet Identity](https://identity.internetcomputer.org/) and a Juno [Satellite](https://juno.build/docs/add-juno-to-an-app/create-a-satellite) during the first boot.

Additionally, developers can provide a configuration file to set a few parameters for configuring a Satellite. This includes the definitions of the Datastore and Storage collections and a list of additional controllers, if required.

## Documentation

Please find the documentation about prerequisites, how to run the image, and configuration options on Juno's website.

## Execution

The container is available on [Docker Hub](https://github.com/junobuild/juno-docker). It can be started using Docker command line or a Compose file.

You can find a sample, including a configuration file for the Juno Satellite, in the [./compose](./compose) folder.

Once you have both files copied to your machine - `docker-componse.yml` and `juno.dev.json` -, you can start the container using the following command:

```bash
docker compose up
```

## Contributions

This project is not meant to provide numerous options for developers to tweak according to their needs, but rather to provide one standard image that any developer in the Juno community can use without any specialized knowledge.

With that in mind, to contribute with an additional module - a module being the required materials and JavaScript scripts to populate a canister smart contract - proceed as follows:

### Source

When the Docker image is built, the WASM files of the smart contracts are downloaded. This operation is performed for the list of sources provided in [modules.json](./modules.json).

### CLI

Module deployment and configuration are executed by the CLI, running various hooks: 

- `status`: Called when the CLI starts to inquire about the module state. This is useful for determining if the related canister should be created or has already been created on the Replica.
- `prepare`: If the module has not been created yet, this hook will create a canister on the Replica. The `prepare` function of all modules is executed before actually deploying the WASM code, ensuring that all canister IDs are known before initializing and installing the contracts.
- `install`: This actually installs the WASM code to the newly created or not yet installed module. 
- `start`: While `prepare` and `install` are only run once when needed, the `start` hook is called each time the Docker image is started again. This allows any potential changes to a configuration that are applied during start to be implemented by stopping and starting the image again.

This module's TypeScript code is located in [cli/src/modules](./cli/src/modules). Each module should be described with the following information:

- `key: string`: A unique key to identify the module. It should match the key used in the [modules.json](./modules.json) source configuration. 
- `name: string;`: A human-readable name, like a nickname.
- `canisterId: string;`: A unique targeted canisterId. Currently, canister ids that are populated are not exposed by the container, therefore it should be set as a static value. i.e., currently, any developers will use the same IDs for their local environment.

Once your module is developed, add it to the list in [./cli/src/modules/modules.ts](./cli/src/modules/modules.ts).

For example, if your module does not require any particular installation arguments or configuration, you can simply extend the default as it is done with Internet Identity:

```typescript
import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const INTERNET_IDENTITY: ModuleDescription = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

export const internetIdentity = new Module(INTERNET_IDENTITY);
```

For a more extended solution that overrides installation and start hooks, have a look at the [Satellite module code](./cli/src/modules/satellite).

## License

MIT © [David Dal Busco](mailto:david.dalbusco@outlook.com)

[juno]: https://juno.build