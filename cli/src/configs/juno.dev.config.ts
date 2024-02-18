import type {JunoDevConfig, JunoDevConfigFnOrObject} from '@junobuild/config';
import {existsSync} from 'node:fs';
import {access, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {JUNO_DEV_CONFIG_FILENAME, JUNO_DEV_JSON} from '../constants/constants';
import type {ConfigType} from '../types/config';
import {nodeRequire} from '../utils/node.utils';

export const junoDevConfigExist = async (): Promise<boolean> => {
  try {
    const {configPath} = junoDevConfigFile();
    await access(configPath);
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
};

export const junoDevConfigFile = (): {configPath: string; configType: ConfigType} => {
  const junoTs = join(process.cwd(), `${JUNO_DEV_CONFIG_FILENAME}.ts`);

  if (existsSync(junoTs)) {
    return {
      configPath: junoTs,
      configType: 'ts'
    };
  }

  const junoJs = join(process.cwd(), `${JUNO_DEV_CONFIG_FILENAME}.js`);

  if (existsSync(junoJs)) {
    return {
      configPath: junoJs,
      configType: 'js'
    };
  }

  const junoMjs = join(process.cwd(), `${JUNO_DEV_CONFIG_FILENAME}.mjs`);

  if (existsSync(junoMjs)) {
    return {
      configPath: junoMjs,
      configType: 'js'
    };
  }

  const junoCjs = join(process.cwd(), `${JUNO_DEV_CONFIG_FILENAME}.cjs`);

  if (existsSync(junoCjs)) {
    return {
      configPath: junoCjs,
      configType: 'js'
    };
  }

  // Support for original juno.json file
  const junoJsonDeprecated = join(process.cwd(), JUNO_DEV_JSON);

  if (existsSync(junoJsonDeprecated)) {
    return {
      configPath: junoJsonDeprecated,
      configType: 'json'
    };
  }

  return {
    configPath: join(process.cwd(), `${JUNO_DEV_CONFIG_FILENAME}.json`),
    configType: 'json'
  };
};

export const readJunoDevConfig = async (): Promise<JunoDevConfig> => {
  const {configPath, configType} = junoDevConfigFile();

  const config = (userDevConfig: JunoDevConfigFnOrObject): JunoDevConfig =>
    typeof userDevConfig === 'function' ? userDevConfig() : userDevConfig;

  switch (configType) {
    case 'ts': {
      const {default: userDevConfig} = nodeRequire<JunoDevConfigFnOrObject>(configPath);
      return config(userDevConfig);
    }
    case 'js': {
      const {default: userDevConfig} = await import(configPath);
      return config(userDevConfig as JunoDevConfigFnOrObject);
    }
    default: {
      const buffer = await readFile(configPath);
      return JSON.parse(buffer.toString('utf-8'));
    }
  }
};
