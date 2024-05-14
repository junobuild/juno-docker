import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const OBSERVATORY: ModuleDescription = {
  key: 'observatory',
  name: 'Observatory',
  canisterId: 'klbfr-lqaaa-aaaak-qbwsa-cai'
};

export const observatory = new Module(OBSERVATORY);
