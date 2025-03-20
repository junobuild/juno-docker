import {execute} from '@junobuild/cli-tools';
import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherBuildDescription} from '../../types/watcher';
import {Watcher} from './_watcher';

export class BuildWatcher extends Watcher {
  readonly #initModule: () => Module;
  readonly #buildCmd: string;

  constructor({moduleFileName, initModule, buildCmd}: WatcherBuildDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
    this.#buildCmd = buildCmd;
  }

  protected async onExec(_params: {context: CliContext}) {
    const mod = this.#initModule();

    console.log(`🌀  New ${mod.name} detected. Starting build.`);

    await this.executeUpgrade();
  }

  private async executeUpgrade() {
    try {
      await execute({
        command: this.#buildCmd
      });
    } finally {
      this.executing = false;
    }
  }
}
