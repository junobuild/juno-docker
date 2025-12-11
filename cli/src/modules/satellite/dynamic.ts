import {fromNullable, isNullish, nonNullish, uint8ArrayToHexString} from '@dfinity/utils';
import {IcManagementCanister} from '@icp-sdk/canisters/ic-management';
import {Principal} from '@icp-sdk/core/principal';
import {
  junoConfigExist as junoConfigExistTools,
  junoConfigFile as junoConfigFileTools
} from '@junobuild/config-loader';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {basename} from 'node:path';
import {readJunoConfig} from '../../configs/juno.config';
import {DEV_SATELLITE, JUNO_CONFIG_FILENAME} from '../../constants/dev.constants';
import type {CliContext} from '../../types/context';
import type {InitDynamicModuleResult, ModuleCanisterId} from '../../types/module';
import {SATELLITE, SatelliteModule} from './index';

const {red, cyan} = kleur;

interface SatelliteDynamicModuleRegisterParams {
  context: CliContext;
  canisterId: ModuleCanisterId;
}

class SatelliteDynamicModule extends SatelliteModule {
  async register({context, canisterId}: SatelliteDynamicModuleRegisterParams): Promise<void> {
    const {state} = context;

    const metadata = state.getModule(this.key);

    // We check the canisterId in case the developer update their configuration at runtime.
    if (nonNullish(metadata) && metadata.canisterId === canisterId) {
      // Satellite has already been registered and initialized once. We do not need to add it to the state again.
      return;
    }

    // We gather the current hash of the canister by fetching the canister status with th IC mgmt.
    // This is useful otherwise dev would have to build twice to make the watcher notice the hash is really different and upgrade the satellite.
    // Plus, this allows to preventively checks if the main identity is a controller of the Satellite.
    // eslint-disable-next-line no-useless-assignment
    let hash: string | undefined = undefined;

    try {
      hash = await this.currentModuleHash({context, canisterId});
    } catch (err: unknown) {
      console.log(red('️‼️  Unexpected error while fetching current module hash:'), err);
      throw err;
    }

    if (isNullish(hash)) {
      const err = new Error(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
        `‼️  The module hash for ${SATELLITE.name}, ID: ${cyan(canisterId.toString())} is undefined.`
      );
      console.log(red(err.message));
      throw err;
    }

    state.saveModule({
      key: this.key,
      name: this.name,
      canisterId,
      // Deployed because the Satellite was created by the dev with the Console UI
      status: 'deployed',
      hash
    });
  }

  private async currentModuleHash({
    context,
    canisterId
  }: SatelliteDynamicModuleRegisterParams): Promise<string | undefined> {
    const {agent} = context;

    const {canisterStatus} = IcManagementCanister.create({
      agent
    });

    const {module_hash} = await canisterStatus({canisterId: Principal.from(canisterId)});

    const installedHash = fromNullable(module_hash);

    if (isNullish(installedHash)) {
      return undefined;
    }

    return uint8ArrayToHexString(installedHash);
  }
}

export const initSatelliteDynamicModule = async ({
  context
}: {
  context: CliContext;
}): Promise<InitDynamicModuleResult<SatelliteDynamicModule>> => {
  if (!(await junoConfigExistTools({filename: JUNO_CONFIG_FILENAME}))) {
    const err = new Error(
      `ℹ️  No configuration file provided. Skipping upgrade of ${SATELLITE.name}.`
    );
    console.log(err.message);
    return {
      err
    };
  }

  const config = await readJunoConfig();

  const satelliteId = config.satellite.ids?.development;

  if (isNullish(satelliteId)) {
    const {configPath} = junoConfigFileTools({filename: JUNO_CONFIG_FILENAME});

    const err = new Error(
      `ℹ️  No ${SATELLITE.name} provided in ${basename(configPath)}. Skipping upgrade.`
    );
    console.log(err.message);

    return {
      err
    };
  }

  const mod = new SatelliteDynamicModule({
    ...SATELLITE,
    canisterId: satelliteId,
    ...(existsSync(DEV_SATELLITE) && {wasmPath: DEV_SATELLITE})
  });

  try {
    // The Satellite is not attached to a static canister ID and is created by the DEV in the Console.
    // That's why we need to register it in the state as if it was deployed - which it is.
    await mod.register({context, canisterId: satelliteId});
  } catch (err: unknown) {
    return {err};
  }

  return {mod};
};
