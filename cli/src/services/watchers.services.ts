import {debounce} from '@dfinity/utils';
import {readFileSync} from 'atomically';
import type {FileChangeInfo} from 'fs/promises';
import {join} from 'node:path';
import {DEV_DEPLOY_FOLDER, DEV_METADATA} from '../constants/constants';
import type {CliContext} from '../types/context';
import type {
  WatcherConsoleInstallDescription,
  WatcherDeployDescription,
  WatcherDescription
} from '../types/watcher';
import {installRelease} from './console.services';
import type {Module} from './modules.services';

export abstract class Watcher {
  protected upgrading = false;
  #requestUpgrade = false;

  protected readonly moduleFileName: string;

  protected constructor({moduleFileName}: WatcherDescription) {
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
  readonly #key: string;
  readonly #name: string;

  constructor({moduleFileName, key, name}: WatcherConsoleInstallDescription) {
    super({moduleFileName});
    this.#key = key;
    this.#name = name;
  }

  protected async tryUpgrade({context}: {context: CliContext}) {
    try {
      console.log(`📡  New ${this.#name} detected. Starting upload to Console.`);

      const metadata = JSON.parse(readFileSync(DEV_METADATA, {encoding: 'utf-8'}));
      const version = metadata[this.#key.replaceAll('-', '_')];

      await installRelease({
        context,
        wasmPath: join(DEV_DEPLOY_FOLDER, this.moduleFileName),
        version,
        key: this.#key,
        name: this.#name
      });
    } finally {
      this.upgrading = false;
    }
  }
}
