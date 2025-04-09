import type {CliContext} from '../../types/context';
import type {WatcherBuildDescription} from '../../types/watcher';
import {Watcher} from './_watcher';

export class BuildWatcher extends Watcher {
  readonly #moduleName: string;
  readonly #build: () => Promise<void>;

  constructor({moduleFileName, build, name}: WatcherBuildDescription) {
    super({moduleFileName});
    this.#moduleName = name;
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
}
