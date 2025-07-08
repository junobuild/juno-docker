import type {CliContext} from '../../types/context';
import type {WatcherBuildDescription} from '../_types/watcher';
import {Watcher} from './_watcher';

export class BuildWatcher extends Watcher {
  readonly #key: string;
  readonly #moduleName: string;
  readonly #build: () => Promise<void>;

  constructor({moduleFileName, build, key, name}: WatcherBuildDescription) {
    super({moduleFileName});
    this.#moduleName = name;
    this.#key = key;
    this.#build = build;
  }

  protected async onExec(_params: {context: CliContext}) {
    console.log(`🌀  Building ${this.#moduleName}...`);

    await this.execute();
  }

  private async execute() {
    try {
      await this.#build();
    } finally {
      this.executing = false;
    }
  }

  matchRequest({
    command,
    subCommand
  }: {
    command: string;
    subCommand: string;
    searchParams: URLSearchParams;
  }): boolean {
    return command === this.#key && subCommand === 'build';
  }
}
