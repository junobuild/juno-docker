import type {Module} from '../../../services/modules.services';
import type {CliContext} from '../../../types/context';
import type {WatcherConfigDescription} from '../_types/watcher';
import {Watcher} from './_watcher';

export class ConfigWatcher extends Watcher {
  readonly #initModule: () => Module;

  constructor({moduleFileName, initModule}: WatcherConfigDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
  }

  protected async onExec(params: {context: CliContext}) {
    await this.execute(params);
  }

  private async execute({context}: {context: CliContext}) {
    try {
      console.log(`🔧  Updating configuration...`);

      const mod = this.#initModule();

      await mod.config(context);
    } finally {
      this.executing = false;
    }
  }
}
