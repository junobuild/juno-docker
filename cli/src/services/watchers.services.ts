import {assertNonNullish, debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import {join} from 'node:path';
import {DEV_DEPLOY_FOLDER} from '../constants/constants';
import type {CliContext} from '../types/context';
import type {
  WatcherConsoleInstallDescription,
  WatcherDeployDescription,
  WatcherDescription
} from '../types/watcher';
import {loadWasm} from '../utils/wasm.utils';
import {getConsoleActor} from './actor.services';
import type {Module} from './modules.services';

export abstract class Watcher {
  protected upgrading = false;
  #requestUpgrade = false;

  protected readonly moduleFileName: string;

  constructor({moduleFileName}: WatcherDescription) {
    this.moduleFileName = moduleFileName;
  }

  onWatch = async ({
    $event: {filename},
    context
  }: {
    $event: FileChangeInfo<string>;
    context: CliContext;
  }) => {
    if (filename !== this.moduleFileName) {
      return;
    }

    if (this.upgrading) {
      this.#requestUpgrade = true;
      return;
    }

    this.#debounceUpgrade({context});
  };

  private readonly upgrade = async ({context}: {context: CliContext}) => {
    this.upgrading = true;

    await this.tryUpgrade({context});

    await this.processPendingUpgrade({context});
  };

  protected abstract tryUpgrade({context}: {context: CliContext}): Promise<void>;

  protected async processPendingUpgrade({context}: {context: CliContext}) {
    if (!this.#requestUpgrade) {
      return;
    }

    this.#requestUpgrade = false;
    await this.upgrade({context});
  }

  readonly #debounceUpgrade = debounce(this.upgrade);
}

export class WatcherDeploy extends Watcher {
  readonly #initModule: () => Module;

  constructor({moduleFileName, initModule}: WatcherDeployDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
  }

  protected async tryUpgrade({context}: {context: CliContext}) {
    const mod = this.#initModule();

    if (mod.isDeployed(context)) {
      this.upgrading = false;
      console.log(`ℹ️  ${mod.name} already deployed. No changes detected.`);

      await this.processPendingUpgrade({context});
      return;
    }

    await this.executeUpgrade({context, mod});
  }

  private async executeUpgrade({context, mod}: {context: CliContext; mod: Module}) {
    try {
      console.log(`🎬  New ${mod.name} detected. Starting upgrade.`);

      await mod.install(context);
    } finally {
      this.upgrading = false;
    }
  }
}

export class WatcherConsoleInstall extends Watcher {
  readonly #initConsoleModule: () => Module;
  readonly #key: string;

  constructor({moduleFileName, initConsoleModule, key}: WatcherConsoleInstallDescription) {
    super({moduleFileName});
    this.#key = key;
    this.#initConsoleModule = initConsoleModule;
  }

  protected async tryUpgrade({context}: {context: CliContext}) {
    try {
      console.log(`📡  New ${this.#key} detected. Starting upload to Console.`);

      const {wasm} = loadWasm({wasmPath: join(DEV_DEPLOY_FOLDER, this.moduleFileName)});
      // TODO
      const version = 'TODO';

      const {canisterId: loadCanisterId, name} = this.#initConsoleModule();
      const canisterId = loadCanisterId(context);

      assertNonNullish(
        canisterId,
        `⚠️  CanisterID for ${name} is not initialized. This is unexpected!`
      );

      const {agent} = context;
      const {reset_release, load_release} = await getConsoleActor({
        agent,
        canisterId
      });

      const segmentType = () => {
        switch (this.#key) {
          case 'satellite':
            return {Satellite: null};
          case 'orbiter':
            return {Orbiter: null};
          default:
            return {MissionControl: null};
        }
      };

      await reset_release(segmentType());

      const chunkSize = 700000;

      const wasmModule = [...new Uint8Array(wasm)];

      for (let start = 0; start < wasmModule.length; start += chunkSize) {
        const chunks = wasmModule.slice(start, start + chunkSize);
        await load_release(segmentType(), chunks, version);
      }

      console.log(`💫  ${this.#key} uploaded to Console.`);
    } finally {
      this.upgrading = false;
    }
  }
}
