import {existsSync} from 'node:fs';
import {DEV_OBSERVATORY} from '../constants/dev.constants';
import {getObservatoryActor} from '../services/actor.services';
import type {ModuleDescription} from '../types/module';
import {JunoModule} from './juno.module';

export const OBSERVATORY_CANISTER_ID = 'klbfr-lqaaa-aaaak-qbwsa-cai';

const OBSERVATORY: ModuleDescription = {
  key: 'observatory',
  name: 'Observatory',
  canisterId: OBSERVATORY_CANISTER_ID
};

export const initObservatoryModule = (): JunoModule =>
  new JunoModule({
    ...OBSERVATORY,
    ...(existsSync(DEV_OBSERVATORY) && {wasmPath: DEV_OBSERVATORY}),
    getActorFn: getObservatoryActor
  });

export const observatory = initObservatoryModule();
