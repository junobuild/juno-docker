import {IDL} from '@dfinity/candid';
import {deploy} from '../services/deploy.services';
import {DeployModuleParams, Module, ModuleInitialDetail} from '../types/module';

const SATELLITE: ModuleInitialDetail = {
  key: 'satellite',
  name: 'Satellite'
};

export const satellite: Module = {
  deploy: async ({identity, ...rest}: DeployModuleParams) => {
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
