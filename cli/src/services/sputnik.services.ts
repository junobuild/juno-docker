import {isEmptyString, isNullish} from '@dfinity/utils';
import {execute, type PackageJson, readPackageJson} from '@junobuild/cli-tools';
import {existsSync} from 'node:fs';
import {
  DEV_BUILD_SPUTNIK,
  DEV_PREPARE_PKG_SPUTNIK,
  DEV_SPUTNIK_PACKAGE_JSON
} from '../constants/dev.constants';

export const buildSputnik = async () => {
  const {success} = await generateMetadata();

  if (!success) {
    return;
  }

  await execute({
    command: DEV_BUILD_SPUTNIK
  });
};

const generateMetadata = async (): Promise<{success: boolean}> => {
  const metadata = await buildMetadata();

  if (isNullish(metadata?.name) || isEmptyString(metadata.name)) {
    console.log(`⚠️  Missing "name" in package metadata. Aborting build!`);
    return {success: false};
  }

  if (isNullish(metadata.version) || isEmptyString(metadata.version)) {
    console.log(`⚠️  Missing "version" in package metadata. Aborting build!`);
    return {success: false};
  }

  const {name, version} = metadata;

  await execute({
    command: DEV_PREPARE_PKG_SPUTNIK,
    args: ['--name', name, '--version', version]
  });

  return {success: true};
};

const buildMetadata = async (): Promise<
  Pick<PackageJson, 'name' | 'version'> | undefined | null
> => {
  if (!existsSync(DEV_SPUTNIK_PACKAGE_JSON)) {
    return null;
  }

  try {
    const {name, version, juno} = await readPackageJson({
      packageJsonPath: DEV_SPUTNIK_PACKAGE_JSON
    });

    return {
      name: juno?.functions?.name ?? name,
      version: juno?.functions?.version ?? version
    };
  } catch (_err: unknown) {
    // The build will use the build version of Sputnik for the extended build version.
    return undefined;
  }
};
