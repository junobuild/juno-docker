import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherBuildDescription} from '../../types/watcher';
import {Watcher} from './_watcher';

export class BuildWatcher extends Watcher {
  readonly #initModule: () => Module;
  readonly #build: () => Promise<void>;

  constructor({moduleFileName, initModule, build}: WatcherBuildDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
    this.#build = build;
  }

  protected async onExec(_params: {context: CliContext}) {
    const mod = this.#initModule();

    console.log(`🌀  Building ${mod.name}...`);

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
