import {existsSync} from 'node:fs';
import {DEV_CONSOLE} from '../../constants/dev.constants';
import {Module} from '../../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {installReleases} from './console.post-install';

export const CONSOLE_CANISTER_ID = 'cokmz-oiaaa-aaaal-aby6q-cai';

export const CONSOLE: ModuleDescription = {
  key: 'console',
  name: 'Console',
  canisterId: CONSOLE_CANISTER_ID
};

class ConsoleModule extends Module {
  override async postInstall(context: ModuleInstallParams): Promise<void> {
    await installReleases(context);
  }
}

export const initConsoleModule = (): ConsoleModule =>
  new ConsoleModule({
    ...CONSOLE,
    ...(existsSync(DEV_CONSOLE) && {wasmPath: DEV_CONSOLE})
  });

export const consoleModule = initConsoleModule();
