import {IDL} from '@dfinity/candid';
import {isNullish} from '@dfinity/utils';
import {existsSync} from 'node:fs';
import {DEV_SATELLITE} from '../../constants/constants';
import {Module} from '../../services/modules.services';
import {CliContext} from '../../types/context';
import {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {configExist, configureCollections, configureControllers} from './satellite.config';

export const SATELLITE: ModuleDescription = {
  key: 'satellite',
  name: 'Satellite',
  canisterId: 'jx5yt-yyaaa-aaaal-abzbq-cai'
};

export class SatelliteModule extends Module {
  override async install({identity, ...rest}: ModuleInstallParams): Promise<void> {
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

  override async start(context: CliContext) {
    if (!(await configExist())) {
      console.log(`ℹ️  No configuration provided to configure ${this.name}.`);
      return;
    }

    await this.config(context);
  }

  async config(context: CliContext) {
    const canisterId = this.canisterId(context);

    if (isNullish(canisterId)) {
      throw new Error('Cannot configure satellite for unknown module id.');
    }

    // One after the other to not stress the replica at boot time? Not sure, it makes sense.
    await configureCollections({...context, canisterId});
    await configureControllers({...context, canisterId});

    console.log(`✅  ${this.name} configured.`);
  }
}

export const initSatelliteModule = (): SatelliteModule =>
  new SatelliteModule({
    ...SATELLITE,
    ...(existsSync(DEV_SATELLITE) && {wasmPath: DEV_SATELLITE})
  });

export const satellite = initSatelliteModule();
