import {isNullish, nonNullish} from '@dfinity/utils';
import {
  junoConfigExist as junoConfigExistTools,
  junoConfigFile as junoConfigFileTools
} from '@junobuild/config-loader';
import {existsSync} from 'node:fs';
import {basename} from 'node:path';
import {readJunoConfig} from '../../configs/juno.config';
import {DEV_SATELLITE, JUNO_CONFIG_FILENAME} from '../../constants/dev.constants';
import type {CliContext} from '../../types/context';
import type {ModuleCanisterId} from '../../types/module';
import {SATELLITE, SatelliteModule} from './index';

class SatelliteDynamicModule extends SatelliteModule {
  register({context, canisterId}: {context: CliContext; canisterId: ModuleCanisterId}) {
    const {state} = context;

    const metadata = state.getModule(this.key);

    console.log(metadata, canisterId);

    // We check the canisterId in case the developer update their configuration at runtime.
    if (nonNullish(metadata) && metadata.canisterId === canisterId) {
      // Satellite has already been registered and initialized once. We do not need to add it to the state again.
      return;
    }


    this.initialize({context, canisterId, status: 'deployed'});

    console.log(context.state.getModule(this.key));
  }


}

export const initSatelliteDynamicModule = async ({
  context
}: {
  context: CliContext;
}): Promise<SatelliteDynamicModule | undefined> => {
  if (!(await junoConfigExistTools({filename: JUNO_CONFIG_FILENAME}))) {
    console.log(`ℹ️  No configuration file provided. Skipping upgrade of ${SATELLITE.name}.`);
    return undefined;
  }

  const config = await readJunoConfig();

  const satelliteId = config.satellite.ids?.development;

  if (isNullish(satelliteId)) {
    const {configPath} = junoConfigFileTools({filename: JUNO_CONFIG_FILENAME});

    console.log(`ℹ️  No ${SATELLITE.name} provided in ${basename(configPath)}. Skipping upgrade.`);
    return undefined;
  }

  const mod = new SatelliteDynamicModule({
    ...SATELLITE,
    canisterId: satelliteId,
    ...(existsSync(DEV_SATELLITE) && {wasmPath: DEV_SATELLITE})
  });

  // The Satellite is not attached to a static canister ID and is created by the DEV in the Console.
  // That's why we need to register it in the state as if it was deployed - which it is.
  mod.register({context, canisterId: satelliteId});

  return mod;
};
