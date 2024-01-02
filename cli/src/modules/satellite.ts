import {IDL} from '@dfinity/candid';
import {Module} from '../services/modules.services';
import {CliContext} from '../types/context';
import type {ModuleDescription} from '../types/module';

const SATELLITE: ModuleDescription = {
  key: 'satellite',
  name: 'Satellite'
};

class SatelliteModule extends Module {
  override async install({identity, ...rest}: CliContext): Promise<void> {
    const arg = IDL.encode(
      [
        IDL.Record({
          controllers: IDL.Vec(IDL.Principal)
        })
      ],
      [{controllers: [identity.getPrincipal()]}]
    );

    await super.install({identity, ...rest, arg});
  }
}

export const satellite = new SatelliteModule(SATELLITE);
