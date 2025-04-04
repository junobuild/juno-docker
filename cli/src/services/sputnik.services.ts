import {nonNullish, notEmptyString} from '@dfinity/utils';
import {execute, readPackageJson} from '@junobuild/cli-tools';
import {existsSync} from 'node:fs';
import {DEV_BUILD_SPUTNIK, DEV_SPUTNIK_PACKAGE_JSON} from '../constants/dev.constants';

export const buildSputnik = async () => {
  const version = await readBuildVersion();

  const env = {
    ...process.env,
    ...(nonNullish(version) && notEmptyString(version) && {CUSTOM_BUILD_VERSION: version})
  };

  await execute({
    command: DEV_BUILD_SPUTNIK,
    env
  });
};

const readBuildVersion = async (): Promise<string | undefined | null> => {
  if (!existsSync(DEV_SPUTNIK_PACKAGE_JSON)) {
    return null;
  }

  try {
    const {version, juno} = await readPackageJson({
      packageJsonPath: DEV_SPUTNIK_PACKAGE_JSON
    });

    return juno?.functions?.version ?? version;
  } catch (_err: unknown) {
    // The build will use the build version of Sputnik for the extended build version.
    return undefined;
  }
};
