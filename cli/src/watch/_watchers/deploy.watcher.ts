import {isNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {WatcherDeployDescription} from '../_types/watcher';
import {Watcher} from './_watcher';

const {red} = kleur;

export class DeployWatcher extends Watcher {
  readonly #initModule: (params: {context: CliContext}) => Promise<Module | undefined>;

  constructor({moduleFileName, initModule}: WatcherDeployDescription) {
    super({moduleFileName});
    this.#initModule = initModule;
  }

  protected async onExec({context}: {context: CliContext}) {
    const mod = await this.#initModule({context});

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

      const {[MAIN_IDENTITY_KEY]: identity} = context.identities;
      console.log('--->', identity.getPrincipal().toText());

      await mod.install(context);
    } catch (err: unknown) {
      console.log(red('️‼️  Unexpected error while installing the module:'), err);
    } finally {
      this.executing = false;
    }
  }
}
