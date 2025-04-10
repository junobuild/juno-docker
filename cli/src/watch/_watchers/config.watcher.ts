import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherConfigDescription} from '../_types/watcher';
import {Watcher} from './_watcher';

const ON_WATCH_DEBOUNCE_DELAY = 5000;

export class ConfigWatcher extends Watcher {
  readonly #initModule: () => Module;

  constructor({moduleFileName, initModule}: WatcherConfigDescription) {
    super({moduleFileName, debounceDelay: ON_WATCH_DEBOUNCE_DELAY});
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
