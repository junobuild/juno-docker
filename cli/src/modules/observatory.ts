import {existsSync} from 'node:fs';
import {DEV_OBSERVATORY} from '../constants/constants';
import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const OBSERVATORY: ModuleDescription = {
  key: 'observatory',
  name: 'Observatory',
  canisterId: 'klbfr-lqaaa-aaaak-qbwsa-cai'
};

export const initObservatoryModule = (): Module =>
  new Module({
    ...OBSERVATORY,
    ...(existsSync(DEV_OBSERVATORY) && {wasmPath: DEV_OBSERVATORY})
  });

export const observatory = initObservatoryModule();
