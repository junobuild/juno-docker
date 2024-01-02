import {IDL} from '@dfinity/candid';
import {deploy, init, status} from '../services/deploy.services';
import type {Module, ModuleInitialDetail, ModuleParams, ModuleStatus} from '../types/module';

const SATELLITE: ModuleInitialDetail = {
  key: 'satellite',
  name: 'Satellite'
};

export const satellite: Module = {
  status: (params: ModuleParams): ModuleStatus | undefined => status({...params, ...SATELLITE}),
  init: async (params: ModuleParams): Promise<void> => {
    await init({...params, ...SATELLITE});
  },
  deploy: async ({identity, ...rest}: ModuleParams) => {
    const arg = IDL.encode(
      [
        IDL.Record({
          controllers: IDL.Vec(IDL.Principal)
        })
      ],
      [{controllers: [identity.getPrincipal()]}]
    );

    await deploy({identity, ...rest, arg, ...SATELLITE});
  }
};
