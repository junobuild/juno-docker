import {existsSync} from 'node:fs';
import {DEV_CONSOLE} from '../constants/constants';
import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

export const CONSOLE_CANISTER_ID = 'cokmz-oiaaa-aaaal-aby6q-cai';

const CONSOLE: ModuleDescription = {
  key: 'console',
  name: 'Console',
  canisterId: CONSOLE_CANISTER_ID
};

export const initConsoleModule = (): Module =>
  new Module({
    ...CONSOLE,
    ...(existsSync(DEV_CONSOLE) && {wasmPath: DEV_CONSOLE})
  });

export const console = initConsoleModule();
