import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const CONSOLE: ModuleDescription = {
  key: 'console',
  name: 'Console',
  canisterId: 'cokmz-oiaaa-aaaal-aby6q-cai'
};

export const console = new Module(CONSOLE);
