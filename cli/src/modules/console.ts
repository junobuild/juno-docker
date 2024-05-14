import {existsSync} from 'node:fs';
import {DEV_CONSOLE} from '../constants/constants';
import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const CONSOLE: ModuleDescription = {
  key: 'console',
  name: 'Console',
  canisterId: 'cokmz-oiaaa-aaaal-aby6q-cai'
};

export const initConsoleModule = (): Module =>
  new Module({
    ...CONSOLE,
    ...(existsSync(DEV_CONSOLE) && {wasmPath: DEV_CONSOLE})
  });

export const console = initConsoleModule();
