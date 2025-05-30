import type {JunoDevConfig, JunoDevConfigFnOrObject} from '@junobuild/config';
import type {ConfigFilename} from '@junobuild/config-loader';
import {
  junoConfigExist as junoConfigExistTools,
  readJunoConfig as readJunoConfigTools
} from '@junobuild/config-loader';
import {JUNO_DEV_CONFIG_FILENAME} from '../constants/dev.constants';

const JUNO_DEV_CONFIG_FILE: {filename: ConfigFilename} = {filename: JUNO_DEV_CONFIG_FILENAME};

export const junoDevConfigExist = async (): Promise<boolean> =>
  await junoConfigExistTools(JUNO_DEV_CONFIG_FILE);

export const readJunoDevConfig = async (): Promise<JunoDevConfig> => {
  const config = (userDevConfig: JunoDevConfigFnOrObject): JunoDevConfig =>
    typeof userDevConfig === 'function' ? userDevConfig() : userDevConfig;

  return await readJunoConfigTools({
    ...JUNO_DEV_CONFIG_FILE,
    config
  });
};
