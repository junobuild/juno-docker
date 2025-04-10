import {IDL} from '@dfinity/candid';
import {isNullish} from '@dfinity/utils';
import {existsSync} from 'node:fs';
import {junoDevConfigExist} from '../../configs/juno.dev.config';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import {DEV_SATELLITE} from '../../constants/dev.constants';
import {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {configureCollections, configureControllers} from './satellite.config';

export const SATELLITE: ModuleDescription = {
  key: 'satellite',
  name: 'Satellite',
  canisterId: 'jx5yt-yyaaa-aaaal-abzbq-cai'
};

export class SatelliteModule extends Module {
  override async install({
    identities: {[MAIN_IDENTITY_KEY]: mainIdentity, ...otherIdentities},
    ...rest
  }: ModuleInstallParams): Promise<void> {
    const arg = IDL.encode(
      [
        IDL.Record({
          controllers: IDL.Vec(IDL.Principal)
        })
      ],
      [{controllers: [mainIdentity.getPrincipal()]}]
    );

    await super.install({
      identities: {[MAIN_IDENTITY_KEY]: mainIdentity, ...otherIdentities},
      ...rest,
      arg
    });
  }

  override async start(context: CliContext) {
    if (!(await junoDevConfigExist())) {
      console.log(`ℹ️  No configuration provided to configure ${this.name}.`);
      return;
    }

    await this.config(context);
  }

  override async config(context: CliContext) {
    const canisterId = this.canisterId(context);

    if (isNullish(canisterId)) {
      throw new Error('Cannot configure satellite for unknown module id.');
    }

    try {
      // One after the other to not stress the replica at boot time? Not sure, it makes sense.
      await configureCollections({...context, canisterId});
      await configureControllers({...context, canisterId});

      console.log(`✅  ${this.name} configured.`);
    } catch (_err: unknown) {
      console.log(
        `❓  ${this.name} not configured. If you were still editing your configuration file, please ignore this error.`
      );
    }
  }
}

export const initSatelliteModule = (): SatelliteModule =>
  new SatelliteModule({
    ...SATELLITE,
    ...(existsSync(DEV_SATELLITE) && {wasmPath: DEV_SATELLITE})
  });

export const satellite = initSatelliteModule();
