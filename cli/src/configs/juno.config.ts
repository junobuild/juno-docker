import type {JunoConfig, JunoConfigFnOrObject} from '@junobuild/config';
import type {ConfigFilename} from '@junobuild/config-loader';
import {readJunoConfig as readJunoConfigTools} from '@junobuild/config-loader';
import {JUNO_CONFIG_FILENAME} from '../constants/dev.constants';

const JUNO_CONFIG_FILE: {filename: ConfigFilename} = {filename: JUNO_CONFIG_FILENAME};

export const readJunoConfig = async (): Promise<JunoConfig> => {
  const config = (userConfig: JunoConfigFnOrObject): JunoConfig =>
    typeof userConfig === 'function' ? userConfig({mode: 'development'}) : userConfig;

  return await readJunoConfigTools({
    ...JUNO_CONFIG_FILE,
    config
  });
};
