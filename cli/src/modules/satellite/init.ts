import {isNullish} from '@dfinity/utils';
import {
  junoConfigExist as junoConfigExistTools,
  junoConfigFile as junoConfigFileTools
} from '@junobuild/config-loader';
import {basename} from 'node:path';
import {readJunoConfig} from '../../configs/juno.config';
import {JUNO_CONFIG_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule, SATELLITE, type SatelliteModule} from './index';

export const initSatelliteDynamicModule = async (): Promise<SatelliteModule | undefined> => {
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

  return initSatelliteModule({
    canisterId: satelliteId
  });
};
