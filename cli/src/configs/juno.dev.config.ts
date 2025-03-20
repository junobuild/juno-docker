import type {JunoDevConfig, JunoDevConfigFnOrObject} from '@junobuild/config';
import type {ConfigFilename} from '@junobuild/config-loader';
import {
  junoConfigExist as junoConfigExistTools,
  junoConfigFile as junoConfigFileTools,
  readJunoConfig as readJunoConfigTools
} from '@junobuild/config-loader';
import {JUNO_DEV_CONFIG_FILENAME} from '../constants/dev.constants';
import type {ConfigType} from '../types/config';

const JUNO_DEV_CONFIG_FILE: {filename: ConfigFilename} = {filename: JUNO_DEV_CONFIG_FILENAME};

export const junoDevConfigExist = async (): Promise<boolean> =>
  await junoConfigExistTools(JUNO_DEV_CONFIG_FILE);

export const junoDevConfigFile = (): {configPath: string; configType: ConfigType} =>
  junoConfigFileTools(JUNO_DEV_CONFIG_FILE);

export const readJunoDevConfig = async (): Promise<JunoDevConfig> => {
  const config = (userDevConfig: JunoDevConfigFnOrObject): JunoDevConfig =>
    typeof userDevConfig === 'function' ? userDevConfig() : userDevConfig;

  return await readJunoConfigTools({
    ...JUNO_DEV_CONFIG_FILE,
    config
  });
};
