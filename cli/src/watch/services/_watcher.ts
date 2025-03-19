import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import type {CliContext} from '../../types/context';
import type {WatcherDescription} from '../../types/watcher';

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
