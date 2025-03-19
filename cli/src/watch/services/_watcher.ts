import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import type {CliContext} from '../../types/context';
import type {WatcherDescription} from '../../types/watcher';

export abstract class Watcher {
  protected executing = false;
  #requestExecution = false;

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

    if (this.executing) {
      this.#requestExecution = true;
      return;
    }

    this.#debounceExec({context});
  };

  private readonly exec = async ({context}: {context: CliContext}) => {
    this.executing = true;

    await this.onExec({context});

    await this.processPendingRequest({context});
  };

  protected abstract onExec({context}: {context: CliContext}): Promise<void>;

  protected async processPendingRequest({context}: {context: CliContext}) {
    if (!this.#requestExecution) {
      return;
    }

    this.#requestExecution = false;
    await this.exec({context});
  }

  readonly #debounceExec = debounce(this.exec);
}
