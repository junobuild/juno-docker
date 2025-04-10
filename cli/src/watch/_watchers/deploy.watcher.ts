import kleur from 'kleur';
import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherDeployDescription, WatcherDeployInitModule} from '../_types/watcher';
import {Watcher} from './_watcher';

const {red} = kleur;

export class DeployWatcher extends Watcher {
  readonly #initModule: WatcherDeployInitModule;

  constructor({moduleFileName, initModule}: WatcherDeployDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
  }

  protected async onExec({context}: {context: CliContext}) {
    const result = await this.#initModule({context});

    const cancelExecution = async () => {
      this.executing = false;

      await this.processPendingRequest({context});
    };

    if ('err' in result) {
      // No stacktrace printed here. It's update to the consumer to print out messages if the module cannot be loaded.
      await cancelExecution();
      return;
    }

    const {mod} = result;

    if (mod.isDeployed(context)) {
      console.log(`ℹ️  ${mod.name} already deployed. No changes detected.`);

      await cancelExecution();
      return;
    }

    await this.executeUpgrade({context, mod});
  }

  private async executeUpgrade({context, mod}: {context: CliContext; mod: Module}) {
    try {
      console.log(`🎬  Upgrading ${mod.name}...`);

      await mod.install(context);
    } catch (err: unknown) {
      console.log(red('️‼️  Unexpected error while installing the module:'), err);
    } finally {
      this.executing = false;
    }
  }
}
