import {isNullish} from '@dfinity/utils';
import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherDeployDescription} from '../_types/watcher';
import {Watcher} from './_watcher';

export class DeployWatcher extends Watcher {
  readonly #initModule: () => Promise<Module | undefined>;

  constructor({moduleFileName, initModule}: WatcherDeployDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
  }

  protected async onExec({context}: {context: CliContext}) {
    const mod = await this.#initModule();

    if (isNullish(mod)) {
      // No stacktrace printed here. It's update to the consumer to print out messages if the module cannot be loaded.
      return;
    }

    if (mod.isDeployed(context)) {
      this.executing = false;
      console.log(`ℹ️  ${mod.name} already deployed. No changes detected.`);

      await this.processPendingRequest({context});
      return;
    }

    await this.executeUpgrade({context, mod});
  }

  private async executeUpgrade({context, mod}: {context: CliContext; mod: Module}) {
    try {
      console.log(`🎬  Upgrading ${mod.name}...`);

      await mod.install(context);
    } finally {
      this.executing = false;
    }
  }
}
