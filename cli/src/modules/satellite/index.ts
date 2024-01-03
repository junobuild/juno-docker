import {IDL} from '@dfinity/candid';
import {isNullish} from '@dfinity/utils';
import {Module} from '../../services/modules.services';
import {CliContext} from '../../types/context';
import {ModuleDescription} from '../../types/module';
import {configureCollections, configureControllers} from './satellite.config';

const SATELLITE: ModuleDescription = {
  key: 'satellite',
  name: 'Satellite',
  canisterId: 'jx5yt-yyaaa-aaaal-abzbq-cai'
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

  override async start(context: CliContext) {
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

export const satellite = new SatelliteModule(SATELLITE);
