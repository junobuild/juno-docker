import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import type {CliContext} from '../types/context';
import type {WatcherDescription} from '../types/watcher';
import type {Module} from './modules.services';

export class Watcher {
  #upgrading = false;
  #requestUpgrade = false;
  readonly #key: string;

  readonly #moduleFileName: string;
  readonly #initModule: () => Module;

  constructor({moduleFileName, initModule, key}: WatcherDescription) {
    this.#key = key;
    this.#moduleFileName = moduleFileName;
    this.#initModule = initModule;
  }

  onWatch = async ({
    $event: {filename},
    context
  }: {
    $event: FileChangeInfo<string>;
    context: CliContext;
  }) => {
    if (filename !== this.#moduleFileName) {
      return;
    }

    if (this.#upgrading) {
      this.#requestUpgrade = true;
      return;
    }

    this.#debounceUpgradeSatellite({context});
  };

  private readonly upgrade = async ({context}: {context: CliContext}) => {
    this.#upgrading = true;

    const mod = this.#initModule();

    if (mod.isDeployed(context)) {
      this.#upgrading = false;
      console.log(`ℹ️  ${mod.name} already deployed. No changes detected.`);

      await this.processPendingUpgrade({context});
      return;
    }

    await this.executeUpgrade({context, mod});

    await this.processPendingUpgrade({context});
  };

  private async executeUpgrade({context, mod}: {context: CliContext; mod: Module}) {
    try {
      console.log(`🎬  New ${mod.name} detected. Starting upgrade.`);

      await mod.install(context);
    } finally {
      this.#upgrading = false;
    }
  }

  private async processPendingUpgrade({context}: {context: CliContext}) {
    if (!this.#requestUpgrade) {
      return;
    }

    this.#requestUpgrade = false;
    await this.upgrade({context});
  }

  readonly #debounceUpgradeSatellite = debounce(this.upgrade);

  get key(): string {
    return this.#key;
  }
}
