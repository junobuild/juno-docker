import {IDL} from '@dfinity/candid';
import {Module} from '../services/modules.services';
import type {ModuleInitialDetail, ModuleParams} from '../types/module';

const SATELLITE: ModuleInitialDetail = {
  key: 'satellite',
  name: 'Satellite'
};

class SatelliteModule extends Module {
  override async deploy({identity, ...rest}: ModuleParams): Promise<void> {
    const arg = IDL.encode(
      [
        IDL.Record({
          controllers: IDL.Vec(IDL.Principal)
        })
      ],
      [{controllers: [identity.getPrincipal()]}]
    );

    await super.deploy({identity, ...rest, arg});
  }
}

export const satellite = new SatelliteModule(SATELLITE);
